import Avatar3D from './Avatar3D';

export default function BotPanel({ mood, theme, onMascotClick }) {
  return (
    <div
      id="mascot-bot-panel"
      className="relative flex items-center justify-center w-full max-w-lg mx-auto"
    >
      <Avatar3D mood={mood} theme={theme} onMascotClick={onMascotClick} />
    </div>
  );
}
