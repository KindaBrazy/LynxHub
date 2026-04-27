export default function Background() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
      <div
        className={
          'absolute bottom-0 left-[-20%] right-0 top-[-10%] h-125 w-125 rounded-full' +
          ' bg-[radial-gradient(circle_farthest-side,rgba(0,120,255,0.4),rgba(255,255,255,0))]'
        }
      />
      <div
        className={
          'absolute bottom-[-20%] right-0 top-[-10%] h-125 w-125 rounded-full' +
          ' bg-[radial-gradient(circle_farthest-side,rgba(255,0,180,0.3),rgba(255,255,255,0))]'
        }
      />
    </div>
  );
}
