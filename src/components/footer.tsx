'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { navLinks } from './navbar';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';

const contactSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(data: z.infer<typeof contactSchema>) {
    console.log(data);
    // TODO: send data to server. Add to mailing list
  }

  return (
    <footer className='flex flex-col px-2 bg-footer-gradient bg-no-repeat bg-center space-y-6'>
      <div className='flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 px-8 md:px-12 lg:px-20 py-4 md:py-8 lg:py-16 min-h-fit h-full'>
        <div className='flex-1 flex flex-col space-y-4'>
          <h2 className='uppercase text-xl'>Our Studio</h2>
          <address className='uppercase not-italic font-semibold'>
            Blue Nomad Labs LLC, <br />
            1123 Broadway, 1014, <br />
            New York, NY 10010.
          </address>
          <p className='uppercase font-semibold'>M-F 11AM to 8PM.</p>

          <div className='mt-auto'>
            <h2 className='uppercase text-xl'>Contact Us</h2>
            <p className='uppercase'>Front Desk - 917-000-0002</p>
          </div>
        </div>

        <div className='flex flex-col flex-1 justify-between h-full'>
          <nav className='inline-flex flex-col space-y-4 tracking-wide'>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className='uppercase font-semibold text-xl'
                target='_blank'
                rel='noopener noreferrer'
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            // href="https://www.instagram.com/bluenomadworld/"
            href='/'
            // target="_blank"
            // rel="noopener noreferrer"
            className='font-semibold uppercase'
          >
            Instagram
          </Link>
        </div>

        <div className='flex flex-col flex-1 space-y-2'>
          <span className='uppercase font-semibold text-2xl lg:text-[2.5rem] tracking-wide'>
            Subscribe for 10% off your first treatment!
          </span>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col space-y-4'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder='E-MAIL'
                        className='placeholder:font-semibold placeholder:text-black placeholder:opacity-85'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className='rounded-full uppercase mt-4 bg-transparent self-end'
                variant={'outline'}
                size={'lg'}
              >
                Discover
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row w-full items-center'>
        <Image
          src='/logo.svg'
          alt=''
          style={{
            width: '100%',
            height: 'auto',
          }}
          width={800}
          height={100}
          sizes={
            '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 85vw, 800px'
          }
        />
        <span className='text-sm uppercase font-bold place-self-end lg:px-20'>
          &#169;{year} &#169; BlueNomadWorld. All Right Reserved
        </span>
      </div>
    </footer>
  );
};
