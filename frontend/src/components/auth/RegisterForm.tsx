import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../api/authApi';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z
    .string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลข'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ').max(50, 'ชื่อต้องไม่เกิน 50 ตัวอักษร'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล').max(50, 'นามสกุลต้องไม่เกิน 50 ตัวอักษร'),
  role: z.enum(['admin', 'area_manager', 'central_kitchen_manager', 'restaurant_manager', 'head_chef', 'staff']),
  locationId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const roleOptions = [
  { value: 'admin', label: 'ผู้ดูแลระบบ' },
  { value: 'area_manager', label: 'ผู้จัดการเขต' },
  { value: 'central_kitchen_manager', label: 'ผู้จัดการครัวกลาง' },
  { value: 'restaurant_manager', label: 'ผู้จัดการร้าน' },
  { value: 'head_chef', label: 'หัวหน้าเชฟ' },
  { value: 'staff', label: 'พนักงาน' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onCancel }) => {
  const { register: registerUser, isLoading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Only admin can access this form
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      // Create clean data object, only include locationId if it has a value
      const cleanedData: RegisterData = {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: registerData.role,
        ...(registerData.locationId && { locationId: registerData.locationId }),
      };
      await registerUser(cleanedData);
      onSuccess?.();
    } catch {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">สร้างบัญชีผู้ใช้ใหม่</h2>
        <p className="text-sm text-gray-600 mt-1">เฉพาะผู้ดูแลระบบเท่านั้น</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              ชื่อ *
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="กรอกชื่อ"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              นามสกุล *
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="กรอกนามสกุล"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ชื่อผู้ใช้ *
            </label>
            <input
              {...register('username')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="กรอกชื่อผู้ใช้"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              อีเมล *
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="กรอกอีเมล"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              รหัสผ่าน *
            </label>
            <div className="mt-1 relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="กรอกรหัสผ่าน"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน *
            </label>
            <div className="mt-1 relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ยืนยันรหัสผ่าน"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            บทบาท *
          </label>
          <select
            {...register('role')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">เลือกบทบาท</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {(selectedRole === 'restaurant_manager' || selectedRole === 'head_chef' || selectedRole === 'staff') && (
          <div>
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
              สาขา
            </label>
            <input
              {...register('locationId')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="รหัสสาขา (ถ้ามี)"
            />
            {errors.locationId && (
              <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ยกเลิก
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังสร้าง...
              </div>
            ) : (
              'สร้างบัญชี'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};