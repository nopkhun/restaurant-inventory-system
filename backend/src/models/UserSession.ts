import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserSessionAttributes {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: Date;
  created_at?: Date;
}

interface UserSessionCreationAttributes extends Optional<UserSessionAttributes, 'id' | 'created_at'> {}

class UserSession extends Model<UserSessionAttributes, UserSessionCreationAttributes> implements UserSessionAttributes {
  public id!: string;
  public user_id!: string;
  public refresh_token!: string;
  public expires_at!: Date;
  public readonly created_at!: Date;
}

UserSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'UserSession',
    tableName: 'user_sessions',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

export default UserSession;