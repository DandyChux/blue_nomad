import Image from 'next/image';
// import EgoHeadshot from '~/assets/Look 5 185.jpg';
import Headshot from '~/assets/Look 4 131.jpg';
import EgoHeadshot from '~/assets/Look 5 185.jpg';

export default function About() {
  return (
    <section className='p-8 lg:p-16 gap-4 lg:gap-10'>
      <div className='flex flex-col items-center md:items-start md:grid md:grid-cols-2 md:grid-rows-2 lg:gap-x-4 lg:gap-y-0 flex-1'>
        <p className='text-lg lg:text-xl order-3 md:order-none'>
          <span className='text-xl lg:text-2xl pr-2'>Blue Nomad</span> was born
          from the intersection of my global business career and an enduring
          passion for beauty, wellness, and culture a journey that has taken me
          across continents and industries. My path has been anything but
          conventional... from studying biology to working as a venture capital
          investor in New York and Atlanta, to building startups across Lagos,
          Johannesburg, and Paris. Alongside these ventures. I immersed myself
          in skin health, performing over 10,000 facials as a licensed therapist
          during residencies at Dermalogica Solo and the Four Seasons Tribeca.
          Through it all, one fundamental truth became clear: the wellness
          industry, as it stands today. is missing the mark. It has been
          confined by narrow ideas of who it&apos;s for and what it looks like
          tethered to familiar images of green juices, Pilates, and exorbitantly
          priced Swiss longevity clinics, and regional stories that fail to
          resonate with a more diverse and global audience.
        </p>
        <h1 className='col-start-2 row-start-1 uppercase md:text-end self-center md:self-start justify-self-center text-2xl lg:text-[5rem] lg:leading-[6.5rem] order-1 md:order-none'>
          Our <br /> Sto<em>r</em>y
        </h1>

        <div className='relative w-full h-3/5 order-3 md:order-none'>
          <Image
            src={EgoHeadshot}
            alt='Ego Headshot'
            className='col-start-1 row-start-2 self-end justify-self-start'
          />
        </div>

        <div className='[&>p]:text-lg [&>p]:lg:text-xl order-4 md:order-none'>
          <p>
            In response, I founded Blue Nomad to reimagine wellness through a
            more inclusive, globally inspired lens. Our first activation a 175
            square foot studio in a historic Gilded Age building near Madison
            Square Park offers bespoke facials and a curated selection of local
            and international brands that embody culture, function, and soul.
            This studio is more than a treatment space; it marks the beginning
            of a broader vision for wellness and invites a meaningful dialogue
            with our audience. In collaboration with Brooklyn based Colombian
            archilect Silvana Vergara Tobin, we created a space where artistry
            meets science and skin health becomes a central expression of well
            being. Each product is personally tested, and every protocol
            thoughtfully developed.
          </p>

          <br />

          <p>
            In an era where wellness has grown more impersonal, dominated by
            large corporations, we aspire to be scaled artisans... honoring the
            craft and care that this industry so desperately needs. Blue Nomad
            invites you to explore the dynamism of wellness. For the curious and
            discerning who are dissatisfied with derivative offerings and seck
            substance over trend, we offer a profound alternative a committed
            and inspired journey to lasting vitality.
          </p>

          <br />

          <p>
            Whether through a visit to our studio, a deep dive into our
            philosophy, or simply as a quiet observer, we welcome you to embark
            on this journey with us.
          </p>

          <div className='flex flex-col text-end'>
            <span className='text-2xl lg:text-3xl'>
              With L<em>ov</em>e,
            </span>
            <span className='text-2xl lg:text-5xl font-bold'>Ònyedikachi</span>
          </div>
        </div>
      </div>

      <div className='lg:w-[30%]'>
        <Image
          src={`${Headshot.src}`}
          alt=''
          className='w-full h-auto'
          width={0}
          height={0}
          sizes='100vw'
        />
      </div>
    </section>
  );
}
