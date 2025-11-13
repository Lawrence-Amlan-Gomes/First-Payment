'use client';

import { useTheme } from '@/app/hooks/useTheme';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ErrorComponent({ is404 = false }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const trimmedPathname = pathname.split('/').pop() || 'unknown';

  const message = is404
    ? `The route '/${trimmedPathname}' isn't a valid page for this application.`
    : 'We encountered an unexpected error. Please try again later or contact support.';

  return (
    <div
      className={`w-screen h-screen flex items-center justify-center ${
        theme ? 'bg-[#ffffff] text-[#aaaaaa]' : 'bg-[#000000] text-[#eeeeee]'
      }`}
    >
      <div className="w-[90%] sm:w-[80%] md:w-[60%] mx-auto px-[5%] sm:px-0 text-center">
        <h1
          className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
            theme ? 'text-[#333333]' : 'text-[#dddddd]'
          }`}
        >
          {is404 ? '404 - Page Not Found' : 'Oops! Something Went Wrong'}
        </h1>
        <p
          className={`text-base sm:text-lg lg:text-xl mb-8 ${
            theme ? 'text-[#666666]' : 'text-[#aaaaaa]'
          }`}
        >
          {message}
        </p>
        <Link
          href="/"
          className={`inline-block px-6 py-3 rounded-lg font-semibold ${
            theme
              ? 'bg-[#333333] text-[#ffffff] hover:bg-[#444444]'
              : 'bg-[#dddddd] text-[#000000] hover:bg-[#cccccc]'
          }`}
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}