import { MenuIcon as Menu } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type NavItem = {
  label: string;
  href: string;
};

export const navLinks: NavItem[] = [
  {
    label: 'Our Story',
    href: '/about',
  },
  {
    label: 'Book a Treatment',
    href: '/',
  },
  {
    label: 'Gift Card',
    href: '/',
  },
];

export const Navbar: React.FC = () => {
  return (
    <header
      className={
        'flex items-center justify-start fixed top-0 w-full bg-transparent py-4 px-2'
      }
    >
      <div className='flex items-center group'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'ghost'} className='ml-4 w-fit h-fit'>
              <Menu
                className='!size-6 lg:!size-8 xl:!size-10'
                strokeWidth={2.5}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={4} className='md:hidden'>
            {navLinks.map((item) => (
              <DropdownMenuItem key={item.label} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <nav className='hidden md:group-hover:flex'>
          <ul className='flex gap-8 *:uppercase'>
            {navLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className='font-semibold text-lg'>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
