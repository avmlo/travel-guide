import React from 'react';
import Image from 'next/image';

// Import assets
import heroImage from './assets/21-6.webp';
import poetry1 from './assets/21-11.webp';
import fiction1 from './assets/21-15.webp';
import poetry2 from './assets/21-19.webp';
import fiction2 from './assets/21-23.webp';
import issueImage from './assets/21-98.webp';
import product1 from './assets/21-105.webp';
import product2 from './assets/21-108.webp';
import product3 from './assets/21-111.webp';
import arrowIcon from './assets/21-30.svg';
import searchIcon from './assets/21-137.svg';
import menuIcon from './assets/21-220.svg';

export default function SoftUnion() {
  return (
    <div className="min-h-screen bg-[#fcfcfa] font-['Inter']">
      {/* Header */}
      <header className="max-w-[1920px] mx-auto px-[60px] py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-[#272727]">Soft Union</h1>
          <nav className="flex items-center gap-8">
            <a href="#" className="text-sm text-[#272727] hover:opacity-60">Support</a>
            <a href="#" className="text-sm text-[#272727] hover:opacity-60">Table Of Contents</a>
            <a href="#" className="text-sm text-[#272727] hover:opacity-60">Print Issues</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-[60px]">
        {/* Greeting Section */}
        <div className="text-center mb-12">
          <p className="text-sm text-[#979797] uppercase mb-2">Good Afternoon</p>
          <p className="text-xs text-[#272727]">Today is October 24, 2025, 03:20</p>
        </div>

        {/* Hero Section */}
        <div className="relative w-full aspect-[1800/804] bg-black overflow-hidden mb-20">
          <Image
            src={heroImage}
            alt="Hero"
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-[#979797] text-[25px] uppercase leading-relaxed">
              Today<br />
              Review<br />
              Franz Kafka<br />
              Misguided Friendship: On Early Reviews
            </div>
          </div>
        </div>

        {/* Featured Articles Grid */}
        <div className="grid grid-cols-4 gap-10 mb-20">
          {/* Poetry 1 */}
          <div className="group cursor-pointer">
            <div className="relative aspect-[420/331] mb-4 overflow-hidden">
              <Image
                src={poetry1}
                alt="Andrew Weatherhead"
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-sm text-[#979797] uppercase text-center mb-2">Poetry</p>
            <p className="text-sm text-[#272727] text-center">
              Andrew Weatherhead<br />Three Poems
            </p>
          </div>

          {/* Fiction 1 */}
          <div className="group cursor-pointer">
            <div className="relative aspect-[420/331] mb-4 overflow-hidden">
              <Image
                src={fiction1}
                alt="Tallulah Papaellinas"
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-sm text-[#979797] uppercase text-center mb-2">Fiction</p>
            <p className="text-sm text-[#272727] text-center">
              Tallulah Papaellinas<br />Dinner
            </p>
          </div>

          {/* Poetry 2 */}
          <div className="group cursor-pointer">
            <div className="relative aspect-[420/331] mb-4 overflow-hidden">
              <Image
                src={poetry2}
                alt="Miller Ganovsky"
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-sm text-[#979797] uppercase text-center mb-2">Poetry</p>
            <p className="text-sm text-[#272727] text-center">
              Miller Ganovsky<br />Two Poems
            </p>
          </div>

          {/* Fiction 2 */}
          <div className="group cursor-pointer">
            <div className="relative aspect-[420/331] mb-4 overflow-hidden">
              <Image
                src={fiction2}
                alt="Barbara"
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-sm text-[#979797] uppercase text-center mb-2">Fiction</p>
            <p className="text-sm text-[#272727] text-center">
              Barbara<br />October—The Deer Moon
            </p>
          </div>
        </div>

        {/* Publishing Info */}
        <p className="text-xs text-[#272727] text-center font-medium mb-20">
          Soft Union publishes New Literature every weekday Monday - Friday
        </p>

        {/* Donation Section */}
        <div className="text-center mb-20">
          <p className="text-sm text-[#979797] uppercase mb-4">Donate</p>
          <p className="text-[41px] text-[#272727] font-medium leading-tight mb-4">
            This website and publication is supported by the sales of the print issues and by generous<br />
            donations.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-4 text-[41px] text-[#0036d5] font-medium hover:opacity-80 transition-opacity"
          >
            Become a sponsor to support New Literature
            <Image src={arrowIcon} alt="Arrow" width={30} height={30} />
          </a>
        </div>

        {/* Popular Pieces Section */}
        <div className="mb-20">
          <p className="text-sm text-[#979797] uppercase text-center mb-8">Popular Pieces</p>
          
          <div className="grid grid-cols-2 gap-20">
            {/* This Week's Most Read */}
            <div>
              <h2 className="text-[26px] text-[#272727] uppercase mb-12">
                This week's most read pieces
              </h2>
              <div className="space-y-8">
                {[
                  { num: 1, author: 'Andrew Weatherhead', title: 'Three Poems' },
                  { num: 2, author: 'Tallulah Papaellinas', title: 'Dinner' },
                  { num: 3, author: 'Miller Ganovsky', title: 'Two Poems' },
                  { num: 4, author: 'Barbara', title: 'October—The Deer Moon' },
                  { num: 5, author: 'Walt John Pearce', title: 'Three Love Stories' },
                ].map((item) => (
                  <div key={item.num} className="group cursor-pointer">
                    <div className="flex items-start gap-8">
                      <span className="text-[26px] text-[#272727]">{item.num}</span>
                      <div>
                        <p className="text-[26px] text-[#979797] group-hover:text-[#272727] transition-colors">
                          {item.author}
                        </p>
                        <p className="text-[22px] text-[#272727] font-medium">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Time Most Read */}
            <div>
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-[26px] text-[#272727] uppercase">
                  All time most read pieces
                </h2>
                <a href="#" className="text-sm text-[#979797] hover:text-[#272727]">
                  Read More
                </a>
              </div>
              <div className="space-y-8">
                {[
                  { num: 1, author: 'Graham Irvin', title: 'Waterfalls' },
                  { num: 2, author: 'Lamb, Jordan Castro', title: 'The Age of Self' },
                  { num: 3, author: 'Walt John Pearce', title: 'Three Love Stories' },
                  { num: 4, author: 'Stephen G. Adubato', title: 'Your Therapist Is Not God (but Neither Is God Your Therapist)' },
                  { num: 5, author: 'Nathan Dragon', title: 'Blowing Bubbles, Soft and Fine' },
                ].map((item) => (
                  <div key={item.num} className="group cursor-pointer">
                    <div className="flex items-start gap-8">
                      <span className="text-[26px] text-[#272727]">{item.num}</span>
                      <div>
                        <p className="text-[26px] text-[#979797] group-hover:text-[#272727] transition-colors">
                          {item.author}
                        </p>
                        <p className="text-[22px] text-[#272727] font-medium">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Latest Issue Section */}
        <div className="grid grid-cols-2 gap-20 mb-20">
          <div className="relative aspect-[3/4]">
            <Image
              src={issueImage}
              alt="Issue #6"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm text-[#979797] uppercase mb-4">Latest Issue</p>
            <h2 className="text-[41px] text-[#272727] font-medium mb-4">
              Issue #6<br />
              Bi-Annual #6
            </h2>
            <p className="text-sm text-[#979797] mb-4">October 2025</p>
            <p className="text-sm text-[#272727] mb-8">
              Featuring: Tallulah Papaellinas, Miller Ganovsky, Walt John Pearce, Andrew Weatherhead, Barbara, Franz Kafka, and more
            </p>
            <p className="text-2xl text-[#272727] font-medium mb-8">$18.00</p>
            <button className="bg-[#272727] text-white px-8 py-4 text-sm uppercase hover:bg-opacity-80 transition-opacity">
              Add to Cart
            </button>
          </div>
        </div>

        {/* Shop Section */}
        <div className="mb-20">
          <div className="grid grid-cols-4 gap-10">
            {/* Product 1 */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square mb-4 overflow-hidden">
                <Image
                  src={product1}
                  alt="Issue #5"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <p className="text-sm text-[#272727] text-center mb-2">Issue #5</p>
              <p className="text-sm text-[#979797] text-center">$18.00</p>
            </div>

            {/* Product 2 */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square mb-4 overflow-hidden bg-[#f5f5f5] flex items-center justify-center">
                <Image
                  src={product2}
                  alt="Tote Bag"
                  width={200}
                  height={200}
                  className="object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <p className="text-sm text-[#272727] text-center mb-2">Tote Bag</p>
              <p className="text-sm text-[#979797] text-center">$25.00</p>
            </div>

            {/* Product 3 */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square mb-4 overflow-hidden bg-[#f5f5f5] flex items-center justify-center">
                <Image
                  src={product3}
                  alt="Cap"
                  width={200}
                  height={200}
                  className="object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <p className="text-sm text-[#272727] text-center mb-2">Cap</p>
              <p className="text-sm text-[#979797] text-center">$30.00</p>
            </div>

            {/* Visit Shop */}
            <div className="flex items-center justify-center">
              <a
                href="#"
                className="text-[#979797] text-lg hover:text-[#272727] transition-colors"
              >
                Visit<br />Shop
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-20">
          <p className="text-sm text-[#979797] uppercase text-center mb-8">Newsletter</p>
          <div className="max-w-2xl mx-auto">
            <p className="text-[41px] text-[#272727] font-medium mb-8">
              Sign up for our newsletter to stay notified of New Literature.
            </p>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 border border-[#272727] text-sm focus:outline-none focus:ring-2 focus:ring-[#272727]"
              />
              <button
                type="submit"
                className="bg-[#272727] text-white px-8 py-4 text-sm uppercase hover:bg-opacity-80 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1920px] mx-auto px-[60px] py-12 border-t border-[#e5e5e5]">
        <div className="grid grid-cols-4 gap-10">
          <div>
            <h3 className="text-sm text-[#272727] font-medium mb-4">About</h3>
            <p className="text-xs text-[#979797] leading-relaxed">
              Soft Union is a literary magazine publishing new literature, poetry, fiction, and reviews.
            </p>
          </div>
          <div>
            <h3 className="text-sm text-[#272727] font-medium mb-4">Contact</h3>
            <p className="text-xs text-[#979797]">
              Email: hello@softunion.com
            </p>
          </div>
          <div>
            <h3 className="text-sm text-[#272727] font-medium mb-4">Follow</h3>
            <div className="space-y-2">
              <a href="#" className="block text-xs text-[#979797] hover:text-[#272727]">
                Instagram
              </a>
              <a href="#" className="block text-xs text-[#979797] hover:text-[#272727]">
                Twitter
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-[#272727] font-medium mb-4">Legal</h3>
            <div className="space-y-2">
              <a href="#" className="block text-xs text-[#979797] hover:text-[#272727]">
                Privacy Policy
              </a>
              <a href="#" className="block text-xs text-[#979797] hover:text-[#272727]">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#e5e5e5] text-center">
          <p className="text-xs text-[#979797]">
            © 2025 Soft Union. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

