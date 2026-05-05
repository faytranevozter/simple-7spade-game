import GameBoardClient from './components/GameBoardClient';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function GameBoardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <GameBoardClient
      difficulty={(params.difficulty as 'easy' | 'normal' | 'hard') || 'normal'}
      playerNames={[
        params.p0 || 'You',
        params.p1 || 'Aria',
        params.p2 || 'Blake',
        params.p3 || 'Cora',
      ]}
    />
  );
}