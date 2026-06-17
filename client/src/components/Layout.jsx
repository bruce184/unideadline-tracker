import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8f5ff] text-slate-950">
      <Navbar />
      <main className="min-h-screen px-4 pb-24 pt-5 sm:px-6 lg:ml-64 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
