import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CubeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'วัตถุดิบทั้งหมด',
      value: '156',
      icon: CubeIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'สต็อกต่ำ',
      value: '12',
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'ใกล้หมดอายุ',
      value: '3',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
    {
      name: 'รายการโอนวันนี้',
      value: '8',
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'stock_in',
      description: 'รับเข้าวัตถุดิบ: เนื้อหมู 50 กก.',
      time: '10 นาทีที่แล้ว',
      user: 'สมชาย ใจดี',
    },
    {
      id: 2,
      type: 'transfer',
      description: 'โอนสต็อก: ผักกาดขาว 20 กก. ไปสาขา 2',
      time: '30 นาทีที่แล้ว',
      user: 'สมหญิง รักงาน',
    },
    {
      id: 3,
      type: 'stock_out',
      description: 'ตัดสต็อก: น้ำมันพืช 5 ลิตร (ใช้ในครัว)',
      time: '1 ชั่วโมงที่แล้ว',
      user: 'เชฟใหญ่ อร่อยดี',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            สวัสดี, {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            ยินดีต้อนรับสู่ระบบจัดการสต็อกสำหรับร้านอาหาร
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            กิจกรรมล่าสุด
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <DocumentTextIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            โดย {activity.user}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            การดำเนินการด่วน
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <CubeIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  บันทึกรับของเข้า
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  บันทึกการรับวัตถุดิบเข้าสต็อก
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <DocumentTextIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  ตรวจนับสต็อก
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  เริ่มการตรวจนับสต็อกประจำวัน
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  ดูรายงาน
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  ดูรายงานสต็อกและการเคลื่อนไหว
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};