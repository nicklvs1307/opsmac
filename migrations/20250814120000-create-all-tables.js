'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Order of table creation is important due to foreign key dependencies.
    // Create tables that are referenced by others first.

    // Core tables (no external FKs or only self-referencing)
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('admin', 'owner', 'manager', 'super_admin'),
        defaultValue: 'owner',
        allowNull: false,
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      locked_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: true,
        unique: true,
      },
      whatsapp: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      preferences: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          cuisine_types: [],
          dietary_restrictions: [],
          communication_preferences: {
            email: true,
            whatsapp: false,
            sms: false
          },
          favorite_dishes: [],
          allergies: []
        },
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_visits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_spent: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      average_rating_given: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      last_visit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      first_visit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      customer_segment: {
        type: Sequelize.ENUM('new', 'regular', 'vip', 'inactive'),
        defaultValue: 'new',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active',
      },
      source: {
        type: Sequelize.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'referral', 'social_media', 'checkin_qrcode'),
        allowNull: true,
      },
      referral_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      referred_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      marketing_consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      phone_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      gdpr_consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      gdpr_consent_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_birthday_message_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          acquisition_source: null,
          utm_campaign: null,
          utm_source: null,
          utm_medium: null,
          device_info: null,
          location_data: null
        },
      },
      rfv_score: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          recency: null,
          frequency: null,
          monetary: null
        },
      },
      nps_segment: {
        type: Sequelize.ENUM('promoter', 'passive', 'detractor', 'unknown'),
        allowNull: true,
        defaultValue: 'unknown',
      },
      last_purchase_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_orders: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      average_ticket: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      last_ticket_value: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      most_bought_products: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      most_bought_categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      purchase_behavior_tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      location_details: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          neighborhood: null,
          city: null,
          zone: null,
          distance_from_store: null
        },
      },
      preferred_communication_channel: {
        type: Sequelize.ENUM('whatsapp', 'email', 'sms', 'push_notification', 'none'),
        allowNull: true,
        defaultValue: 'none',
      },
      campaign_interaction_history: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      last_survey_completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_survey_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Surveys',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('restaurants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cuisine_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      zip_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsapp_api_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsapp_api_key: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsapp_instance_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      whatsapp_phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      logo: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      cover_image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      opening_hours: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '09:00', close: '22:00', closed: false },
          sunday: { open: '09:00', close: '22:00', closed: false }
        },
      },
      social_media: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { facebook: '', instagram: '', twitter: '', whatsapp: '' },
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          feedback_enabled: true,
          whatsapp_enabled: false,
          rewards_enabled: true,
          auto_response: true,
          nps_enabled: true,
          tablet_mode: false,
          checkin_requires_table: false,
          checkin_program_settings: {},
          survey_program_settings: {},
          primary_color: '#3f51b5',
          secondary_color: '#f50057',
          integrations: {},
          enabled_modules: []
        },
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_open: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      pos_status: {
        type: Sequelize.ENUM('open', 'closed'),
        defaultValue: 'closed',
        allowNull: false,
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'basic', 'premium', 'enterprise'),
        defaultValue: 'free',
      },
      subscription_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_tables: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      total_feedbacks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      nps_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_promoters: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      total_neutrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      total_detractors: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      api_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      nps_criteria_scores: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('rewards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reward_type: {
        type: Sequelize.ENUM('discount_percentage', 'discount_fixed', 'free_item', 'points', 'cashback', 'gift', 'spin_the_wheel'),
        allowNull: false,
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      wheel_config: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      points_required: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 100,
      },
      max_uses_per_customer: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_uses_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      current_uses: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      minimum_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      applicable_items: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      excluded_items: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      valid_from: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      valid_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      days_valid: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      coupon_validity_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      auto_apply: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      requires_approval: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      terms_conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      trigger_conditions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          min_rating: null,
          feedback_type: null,
          visit_count: null,
          total_spent: null,
          customer_segment: null,
          special_occasions: []
        },
      },
      notification_settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          send_email: true,
          send_whatsapp: false,
          send_push: false,
          custom_message: ''
        },
      },
      analytics: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          total_generated: 0,
          total_redeemed: 0,
          redemption_rate: 0,
          average_order_value: 0,
          customer_satisfaction: 0
        },
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('NpsCriterions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // No timestamps as per model definition
    });

    await queryInterface.createTable('surveys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'inactive', 'archived'),
        defaultValue: 'draft',
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('delivery_csat', 'menu_feedback', 'customer_profile', 'nps_only', 'performance_review', 'salon_ratings', 'salon_nps', 'delivery_nps', 'salon_csat', 'service_checklist', 'salon_like_dislike', 'custom'),
        allowNull: false,
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reward_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'rewards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      coupon_validity_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rotation_group: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('survey_responses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      survey_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'surveys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('questions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      survey_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'surveys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_text: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      question_type: {
        type: Sequelize.ENUM('text', 'textarea', 'radio', 'checkboxes', 'dropdown', 'nps', 'csat', 'ratings', 'like_dislike'),
        allowNull: false,
      },
      options: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nps_criterion_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'NpsCriterions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // No timestamps as per model definition
    });

    await queryInterface.createTable('answers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      response_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'survey_responses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      answer_value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // No timestamps as per model definition
    });

    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      reward_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'redeemed', 'expired', 'cancelled'),
        defaultValue: 'active',
      },
      generated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      redeemed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      order_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      discount_applied: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      redemption_location: {
        type: Sequelize.ENUM('online', 'in_store', 'delivery', 'takeout'),
        allowNull: true,
      },
      redemption_method: {
        type: Sequelize.ENUM('qrcode', 'manual', 'pos_system', 'app'),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      qr_code_data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notification_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      notification_sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      reminder_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      reminder_sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      visit_milestone: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      reward_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'rewards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      redeemed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('checkins', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      checkin_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      table_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      coupon_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'coupons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      checkout_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }, {
      underscored: true,
    });

    await queryInterface.createTable('feedbacks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nps_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      feedback_type: {
        type: Sequelize.ENUM('compliment', 'complaint', 'suggestion', 'general'),
        defaultValue: 'general',
      },
      source: {
        type: Sequelize.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual'),
        allowNull: false,
      },
      table_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      visit_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      categories: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          food_quality: null,
          service_quality: null,
          ambiance: null,
          price_value: null,
          cleanliness: null,
          speed: null
        },
      },
      sentiment: {
        type: Sequelize.ENUM('positive', 'neutral', 'negative'),
        allowNull: true,
      },
      sentiment_score: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'responded', 'resolved', 'archived'),
        defaultValue: 'pending',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      is_anonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verification_method: {
        type: Sequelize.ENUM('email', 'phone', 'receipt', 'none'),
        defaultValue: 'none',
      },
      response_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      response_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      responded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      follow_up_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      follow_up_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      internal_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          ip_address: null,
          user_agent: null,
          device_type: null,
          location: null,
          session_id: null
        },
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('ingredients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      unit_of_measure: {
        type: Sequelize.ENUM('g', 'kg', 'ml', 'L', 'unidade', 'colher de chá', 'colher de sopa', 'xícara', 'pitada', 'a gosto'),
        allowNull: false,
      },
      cost_per_unit: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0.0000,
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      sku: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_pizza: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      pizza_type: {
        type: Sequelize.ENUM('variable_price', 'fixed_price'),
        allowNull: true,
      },
      available_for_delivery: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      available_for_dine_in: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      available_for_online_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      available_for_digital_menu: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('technical_specifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('recipe_ingredients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      technical_specification_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'technical_specifications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ingredient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ingredients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('stocks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('in', 'out'),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      movement_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      external_order_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      platform: {
        type: Sequelize.ENUM('ifood', 'delivery_much', 'uai_rango', 'saipos', 'other'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled', 'concluded', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      customer_details: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      order_details: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      delivery_address: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      delivery_type: {
        type: Sequelize.ENUM('delivery', 'pickup', 'dine_in'),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // A ordem de exclusão das tabelas é importante devido às dependências de chave estrangeira.
    // Exclua as tabelas que referenciam outras primeiro.

    await queryInterface.dropTable('stock_movements');
    await queryInterface.dropTable('stocks');
    await queryInterface.dropTable('recipe_ingredients');
    await queryInterface.dropTable('technical_specifications');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('whatsapp_messages');
    await queryInterface.dropTable('waiter_calls');
    await queryInterface.dropTable('table_sessions');
    await queryInterface.dropTable('tables');
    await queryInterface.dropTable('qr_codes');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('ingredients');
    await queryInterface.dropTable('feedbacks');
    await queryInterface.dropTable('checkins');
    await queryInterface.dropTable('coupons');
    await queryInterface.dropTable('answers');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('survey_responses');
    await queryInterface.dropTable('surveys');
    await queryInterface.dropTable('NpsCriterions');
    await queryInterface.dropTable('rewards');
    await queryInterface.dropTable('restaurants');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('customers');
  }
};
