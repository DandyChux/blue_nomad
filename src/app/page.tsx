import Image from 'next/image';
// import EgoHeadshot from '~/assets/Look 5 185.jpg';
import EgoHeadshot from '~/assets/Look 5 185.jpg';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';

export default function Home() {
  return (
    // Hero Section
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
        <h1 className='uppercase text-3xl xl:text-5xl text-center w-full md:w-[20rem] xl:w-[32.5rem] font-normal'>
          A Pri<em>va</em>te Skin Health Studio in NYC
        </h1>

        {/* <Image src="/" alt="" /> */}
        <Skeleton className='w-[30%] h-[25%]' aria-hidden='true' />

        <Button
          className='uppercase rounded-full text-lg h-auto'
          variant='outline'
          size={'lg'}
        >
          Discover our <br /> first offering
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
          Modern <em>Wellness</em> <br />
          Inspired <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;By <em>Worlds</em> near. <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Far{' '}
          <em>&</em> Within
        </p>
      </div>
    </section>
  );
}
