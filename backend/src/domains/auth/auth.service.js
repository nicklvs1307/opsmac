const { generateToken } = require('services/jwtService');
const { UnauthorizedError, ForbiddenError, NotFoundError } = require('utils/errors');

const iamService = require('services/iamService'); // Import the new IAM service
const auditService = require('services/auditService'); // Import auditService

module.exports = (models) => {
    console.log('Models object in auth.service.js:', models);
    // Helper to build the menu hierarchy with access flags


    const login = async (email, password) => {
        let user = await models.User.findOne({
            where: { email },
            include: [
                {
                    model: models.Role,
                    as: 'roles',
                },
                {
                    model: models.UserRestaurant,
                    as: 'restaurants',
                    include: [{ model: models.Restaurant, as: 'restaurant' }],
                },
            ],
        });

        if (!user) {
            throw new UnauthorizedError('Credenciais inválidas');
        }



        if (user.isLocked()) {
            throw new ForbiddenError('Conta temporariamente bloqueada devido a muitas tentativas de login');
        }


        if (!user.isActive) {
            throw new UnauthorizedError('Conta desativada. Entre em contato com o suporte');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            throw new UnauthorizedError('Credenciais inválidas');
        }

        await user.resetLoginAttempts();

        const token = generateToken(user.id);

        let permissionSnapshot = null;
        let primaryRestaurant = null;
        let primaryRestaurantId = null;

        if (user.isSuperadmin) {
            // For Super Admin, create a snapshot that grants all permissions
            permissionSnapshot = {
                isSuperAdmin: true,
                permissions: {}, // Empty means no specific feature checks, relies on isSuperadmin
            };
        } else {
            // For regular users, determine the primary restaurant and build permissions
            if (user.userRestaurants && user.userRestaurants.length > 0) {
                // Find the owned restaurant first, or the first associated one
                const ownedRestaurant = user.userRestaurants.find(ur => ur.isOwner)?.restaurant;
                if (ownedRestaurant) {
                    primaryRestaurant = ownedRestaurant;
                    primaryRestaurantId = ownedRestaurant.id;
                } else {
                    primaryRestaurant = user.userRestaurants[0].restaurant;
                    primaryRestaurantId = user.userRestaurants[0].restaurant.id;
                }
            }

            // Build the permission snapshot for the primary restaurant
            if (primaryRestaurantId) {
                permissionSnapshot = await iamService.buildSnapshot(primaryRestaurantId, user.id);
            }
        }


        await auditService.log(user, primaryRestaurantId, 'USER_LOGIN', `User:${user.id}`, { email }); // Audit log for successful login

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
            restaurants: user.restaurants?.map(ur => ur.restaurant) || [], // All associated restaurants
            restaurant: primaryRestaurant, // The selected/primary restaurant
            restaurantId: primaryRestaurantId, // The ID of the selected/primary restaurant
            permissionSnapshot: permissionSnapshot, // The full permission snapshot
        };
    };

    const getMe = async (userId) => {
        console.log('models.User in getMe (before findByPk):', models.User);
        if (!models.User) {
            console.error('models.User is undefined in getMe!');
            throw new Error('models.User is not defined. Cannot fetch user.');
        }
        const user = await models.User.findByPk(userId, {
            include: [
                {
                    model: models.Role, // Use models.Role
                    as: 'roles',
                },
                {
                    model: models.UserRestaurant, // Use models.UserRestaurant
                    as: 'restaurants',
                    include: [{ model: models.Restaurant, as: 'restaurant' }],
                },
            ]
        });
            

        if (!user) {
            throw new NotFoundError('Usuário não encontrado');
        }



        let permissionSnapshot = null;
        let primaryRestaurant = null;
        let primaryRestaurantId = null;

        if (user.isSuperadmin) {
            // For Super Admin, create a snapshot that grants all permissions
            permissionSnapshot = {
                isSuperAdmin: true,
                permissions: {}, // Empty means no specific feature checks, relies on isSuperadmin
            };
        } else {
            // For regular users, determine the primary restaurant and build permissions
            if (user.restaurants && user.restaurants.length > 0) {
                const ownedRestaurant = user.restaurants.find(ur => ur.isOwner)?.restaurant;
                if (ownedRestaurant) {
                    primaryRestaurant = ownedRestaurant;
                    primaryRestaurantId = ownedRestaurant.id;
                } else {
                    primaryRestaurant = user.restaurants[0].restaurant;
                    primaryRestaurantId = user.restaurants[0].restaurant.id;
                }
            }

            if (primaryRestaurantId) {
                permissionSnapshot = await iamService.buildSnapshot(primaryRestaurantId, user.id);
            }
        }



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
            restaurants: user.restaurants?.map(ur => ur.restaurant) || [],
            restaurant: primaryRestaurant,
            restaurantId: primaryRestaurantId,
            permissionSnapshot: permissionSnapshot,
        };
    };

    const updateProfile = async (userId, profileData) => {
        // Use models.User instead of db.User
        const user = await models.User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('Usuário não encontrado');
        }

        await user.update(profileData);

        await auditService.log(user, null, 'USER_PROFILE_UPDATED', `User:${user.id}`, profileData); // Audit log for profile update

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar
        };
    };

    const changePassword = async (userId, currentPassword, newPassword) => {
        // Use models.User instead of db.User
        const user = await models.User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('Usuário não encontrado');
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedError('Senha atual incorreta');
        }

        await user.update({ password: newPassword });
        await auditService.log(user, null, 'USER_PASSWORD_CHANGED', `User:${user.id}`, {}); // Audit log for password change
    };


    return {
        login,
        getMe,
        updateProfile,
        changePassword,
    };
};