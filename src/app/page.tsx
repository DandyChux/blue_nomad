import Image from 'next/image';
import Link from 'next/link';
// import EgoHeadshot from '~/assets/Look 5 185.jpg';
import TreatmentShot3 from '~/assets/Look 1 435.jpg';
import TreatmentShot1 from '~/assets/Look 2 145.jpg';
import Headshot from '~/assets/Look 4 165.jpg';
import OnyedikaHeadshot from '~/assets/Look 4 44.jpg';
import EgoHeadshot from '~/assets/Look 5 185.jpg';
import TreatmentShot2 from '~/assets/Look 5 259.jpg';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section>
        <div className='flex flex-col flex-1 items-center bg-hero-section-gradient bg-no-repeat bg-cover bg-center py-20 justify-around'>
          <div className='relative w-full lg:w-[85%]'>
            <Image
              src='/logo.svg'
              alt='hero'
              width={0}
              height={0}
              sizes='100vw'
              className='w-full h-auto'
            />
          </div>
          <h1 className='uppercase text-center w-full lg:w-3/5 font-normal'>
            A Pri<em>va</em>te Skin Health Studio in NYC
          </h1>

          {/* <Image src="/" alt="" /> */}
          <Skeleton className='w-[30%] h-[25%]' aria-hidden='true' />

          <Button
            className='uppercase rounded-full text-lg h-auto'
            variant='outline'
            size={'lg'}
          >
            Discover our first offering
          </Button>
        </div>

        <div
          className='flex flex-col lg:flex-row flex-1 place-items-center p-4'
          style={{
            backgroundImage: `url('${EgoHeadshot.src}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <p className='uppercase text-2xl lg:text-3xl xl:text-5xl pl-4 md:pl-8 lg:pl-32 pt-32 mx-auto lg:mx-0 text-black'>
            Modern <em>Wellness</em>
            Inspired &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;By <em>Worlds</em>{' '}
            near.
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Far{' '}
            <em>&</em> Within
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className='py-12 px-8 lg:items-center'>
        <div className='flex-1'>
          <Image
            src={Headshot}
            alt=''
            width={0}
            height={0}
            sizes='100vw'
            className='w-full h-auto'
          />
        </div>

        <div className='flex-[1_1_30%] flex flex-col items-center gap-10'>
          <p className='text-center lg:w-1/2 text-lg lg:text-2xl'>
            Redefines wellness by blending timesless experiences, guiding
            curious minds on transformative journeys from urban alcoves to
            distant escapes.
          </p>

          <h1 className='uppercase text-center text-3xl font-normal lg:text-6xl'>
            {' '}
            For the curious & discerning
          </h1>

          <Button
            className='uppercase rounded-full h-auto py-1 px-10'
            variant={'outline'}
            size={'lg'}
          >
            Our story
          </Button>
        </div>
      </section>

      {/* Treatments Section */}
      <section className='lg:flex-col items-center'>
        <h1 className='uppercase'>
          Treatme<em>n</em>ts
        </h1>
        <p className='text-lg lg:text-xl'>Custom Skincare Tailored for You</p>

        {/* TODO: Refactor into separate server component */}
        <div className='flex flex-col lg:flex-row gap-4 py-8'>
          <Card className='rounded-none flex-1'>
            <CardHeader>
              <CardTitle className='font-normal text-xl lg:text-3xl tracking-wide'>
                Facial ST 60min.
              </CardTitle>
              <CardDescription className='text-lg lg:text-2xl text-black'>
                $250
              </CardDescription>
              <CardDescription className='lg:text-xl text-black'>
                An all inclusive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Image src={TreatmentShot1} alt='' className='w-auto' />
            </CardContent>
          </Card>

          <Card className='rounded-none flex-1 bg-primary text-white'>
            <CardHeader className='order-2'>
              <CardTitle className='font-normal text-xl lg:text-3xl tracking-wide'>
                Facial ST 60min.
              </CardTitle>
              <CardDescription className='text-white'>
                Membership
              </CardDescription>
              <CardDescription className='text-white'>$215</CardDescription>
            </CardHeader>
            <CardContent className='order-1'>
              <Image src={TreatmentShot2} alt='' className='w-auto' />
            </CardContent>
          </Card>

          <Card className='rounded-none flex-1'>
            <CardHeader>
              <CardTitle className='font-normal text-xl lg:text-3xl tracking-wide'>
                Chemical Peel 45min.
              </CardTitle>
              <CardDescription>$225</CardDescription>
            </CardHeader>
            <CardContent>
              <Image src={TreatmentShot3} alt='' className='w-auto' />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partners Section */}
      <section className='lg:flex-col items-center min-h-fit py-12'>
        <p>Some Favorites from:</p>
        <h1 className='uppercase text-center'>
          Our Curated <em>In</em>-Studio Co<em>ll</em>ection
        </h1>

        <div className='relative w-full'>
          <Image
            src='/partners.svg'
            alt='hero'
            width={0}
            height={0}
            sizes='100vw'
            className='w-full h-auto'
          />
        </div>
      </section>

      {/* Testimonial Section */}
      <section className='lg:flex-col px-4 md:px-8 lg:px-12 min-h-fit py-12'>
        <figure className='flex flex-col'>
          <blockquote className='uppercase text-base lg:text-5xl'>
            <p>
              I <em>seek</em> out brands
            </p>{' '}
            <p className='pl-[5%] lg:pl-[10%]'>
              From diverse origins, curating those
            </p>{' '}
            <p>
              That are efficacious, cultured, &{' '}
              <span className='lowercase'>g</span>
              enuine-each
            </p>{' '}
            <p>with an ethos that</p>
            <p className='pl-[40%] lg:pl-[25%]'>
              <span className='lowercase'>g</span>oes <em>skin</em> deep.
            </p>
          </blockquote>

          <figcaption className='flex flex-col-reverse md:flex-row gap-2 place-self-end'>
            <div className='place-self-end'>
              <p className='text-xl lg:text-2xl text-end'>Ònyedikachi</p>
              <small className='lg:text-lg'>
                founder / Skin Therapist Blue Nomad
              </small>
            </div>
            <Image
              src={OnyedikaHeadshot}
              alt='Ònyedikachi'
              width={150}
              height={200}
              // sizes='100vw'
              // className='w-full h-auto'
            />
          </figcaption>
        </figure>

        {/* Insert "EARNED LOVE" section */}
      </section>

      {/* Social Section */}
      <section className='lg:flex-col items-center px-2 pt-8 pb-20 gap-2 bg-media-section-gradient text-white min-h-fit'>
        <h1 className='uppercase'>Nomad&apos;s Land</h1>
        <p>People, Places, & Vibes that Interest Us</p>
        <Button
          variant={'outline'}
          size={'lg'}
          className='mx-auto rounded-full border-white'
        >
          <Link
            href='https://www.instagram.com/bluenomadworld'
            className='uppercase'
          >
            @bluenomadworld
          </Link>
        </Button>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:gap-2'>
          {/* Add your images here */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className={'w-[15rem] h-[20rem]'}></Skeleton>
          ))}
        </div>
      </section>
    </>
  );
}
