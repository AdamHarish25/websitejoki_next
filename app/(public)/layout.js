import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import CtaSection from '@/components/sections/CTASection';

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className='min-h-screen'>
        {children}
      </main>
      <CtaSection />
      <Footer />
    </>
  );
}

// export default function PublicLayout({ children }) {
//   return (
//     <div>
//       <header className="p-4 bg-blue-500 text-white">Ini Navbar</header>
//       <main>
//         {children}
//       </main>
//       <footer className="p-4 bg-gray-800 text-white">Ini Footer</footer>
//     </div>
//   );
// }