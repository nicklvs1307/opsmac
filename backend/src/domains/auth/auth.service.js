import { generateToken, decodeToken } from "../../services/jwtService.js";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors.js";

import iamService from "../../services/iamService.js";
import auditService from "../../services/auditService.js";
import logger from "../../utils/logger.js";
import cacheService from "../../services/cacheService.js";

class AuthService {
  constructor(models) {
    this.models = models;
  }

  // Helper to build the menu hierarchy with access flags
  async _buildUserPermissionData(user) {
    let permissionSnapshot = null;
    let primaryRestaurant = null;
    let primaryRestaurantId = null;

    // Determine the primary restaurant for all users, including superadmins
    if (user.restaurants && user.restaurants.length > 0) {
      const ownedRestaurant = user.restaurants.find(
        (ur) => ur.isOwner,
      )?.restaurant;
      if (ownedRestaurant) {
        primaryRestaurant = ownedRestaurant;
        primaryRestaurantId = ownedRestaurant.id;
      } else {
        primaryRestaurant = user.restaurants[0].restaurant;
        primaryRestaurantId = user.restaurants[0].restaurant.id;
      }
    }

    if (user.isSuperadmin) {
      // For Super Admin, create a snapshot that grants all permissions
      permissionSnapshot = {
        isSuperAdmin: true,
        permissions: {}, // Empty means no specific feature checks, relies on isSuperadmin
      };
    } else {
      // For regular users, build permissions for the primary restaurant
      if (primaryRestaurantId) {
        permissionSnapshot = await iamService.buildSnapshot(
          primaryRestaurantId,
          user.id,
        );
      }
    }

    return { permissionSnapshot, primaryRestaurant, primaryRestaurantId };
  }

  async login(email, password) {
    let user;
    try {
      user = await this.models.User.findOne({
        where: { email },
        include: [
          {
            model: this.models.Role,
            as: "roles",
          },
          {
            model: this.models.UserRestaurant,
            as: "restaurants",
            include: [{ model: this.models.Restaurant, as: "restaurant" }],
          },
        ],
      });
    } catch (error) {
      logger.error("Error during User.findOne in login:", error);
      throw error;
    }

    if (!user) {
      // Audit log for failed login: User not found
      await auditService.log(
        null, // No user object yet
        null, // No restaurant context yet
        "USER_LOGIN_FAILED",
        `Email:${email}`,
        { reason: "User not found" },
      );
      throw new UnauthorizedError("Credenciais inválidas");
    }

    if (user.isLocked()) {
      // Audit log for failed login: Account locked
      await auditService.log(
        user,
        null, // No restaurant context yet
        "USER_LOGIN_FAILED",
        `User:${user.id}`,
        { reason: "Account locked" },
      );
      throw new ForbiddenError(
        "Conta temporariamente bloqueada devido a muitas tentativas de login",
      );
    }

    if (!user.isActive) {
      // Audit log for failed login: Account deactivated
      await auditService.log(
        user,
        null, // No restaurant context yet
        "USER_LOGIN_FAILED",
        `User:${user.id}`,
        { reason: "Account deactivated" },
      );
      throw new UnauthorizedError(
        "Conta desativada. Entre em contato com o suporte",
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      // Audit log for failed login: Incorrect password
      await auditService.log(
        user,
        null, // No restaurant context yet
        "USER_LOGIN_FAILED",
        `User:${user.id}`,
        { reason: "Incorrect password" },
      );
      throw new UnauthorizedError("Credenciais inválidas");
    }

    await user.resetLoginAttempts();

    const token = generateToken(user.id);

    const { permissionSnapshot, primaryRestaurant, primaryRestaurantId } =
      await this._buildUserPermissionData(user);

    await auditService.log(
      user,
      primaryRestaurantId,
      "USER_LOGIN",
      `User:${user.id}`,
      { email },
    ); // Audit log for successful login

    return {
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      avatar: user.avatar,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      restaurants: user.restaurants?.map((ur) => ur.restaurant) || [], // All associated restaurants
      restaurant: primaryRestaurant, // The selected/primary restaurant
      restaurantId: primaryRestaurantId, // The ID of the selected/primary restaurant
      isSuperadmin: user.isSuperadmin, // Add this line
      permissionSnapshot: permissionSnapshot, // The full permission snapshot
    };
  }

  async getMe(userId) {
    const user = await this.models.User.findByPk(userId, {
      include: [
        {
          model: this.models.Role,
          as: "roles",
        },
        {
          model: this.models.UserRestaurant, // Use models.UserRestaurant
          as: "restaurants",
          include: [{ model: this.models.Restaurant, as: "restaurant" }],
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const { permissionSnapshot, primaryRestaurant, primaryRestaurantId } =
      await this._buildUserPermissionData(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      avatar: user.avatar,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      restaurants: user.restaurants?.map((ur) => ur.restaurant) || [],
      restaurant: primaryRestaurant,
      restaurantId: primaryRestaurantId,
      isSuperadmin: user.isSuperadmin,
      permissionSnapshot: permissionSnapshot,
    };
  }

  async updateProfile(userId, profileData) {
    // Use models.User instead of db.User
    const user = await this.models.User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    await user.update(profileData);

    await auditService.log(
      user,
      null,
      "USER_PROFILE_UPDATED",
      `User:${user.id}`,
      profileData,
    ); // Audit log for profile update

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Use models.User instead of db.User
    const user = await this.models.User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError("Senha atual incorreta");
    }

    await user.update({ password: newPassword });
    await auditService.log(
      user,
      null,
      "USER_PASSWORD_CHANGED",
      `User:${user.id}`,
      {},
    ); // Audit log for password change
  }

  async logout(token) {
    if (!token) {
      return; // No token to blacklist
    }

    try {
      const decoded = decodeToken(token); // Decodifica o token para obter o payload
      if (!decoded || !decoded.exp) {
        logger.warn(
          "Invalid or expired token provided for logout, cannot blacklist.",
        );
        return;
      }

      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const expiresIn = decoded.exp - now; // Time remaining until expiration in seconds

      if (expiresIn > 0) {
        const blacklistKey = `jwt_blacklist:${token}`;
        await cacheService.set(blacklistKey, "blacklisted", expiresIn);
        logger.info(
          `Token blacklisted: ${token.substring(0, 10)}... (expires in ${expiresIn}s)`,
        );
      } else {
        logger.info("Token already expired, no need to blacklist.");
      }
    } catch (error) {
      logger.error("Error blacklisting token during logout:", error);
    }
  }
}

export default (models) => new AuthService(models);
