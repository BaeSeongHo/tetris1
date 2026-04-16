import Tetris from '../components/Tetris';

export const metadata = {
  title: 'Next.js Tetris',
  description: 'A modern Tetris game built with Next.js and Tailwind CSS',
};

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-black overflow-hidden">
      <Tetris />
    </main>
  );
}
