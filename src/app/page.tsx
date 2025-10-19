import FullScreenMap from "../components/BasicMap";

export default function Home() {
  return (
    <div className="relative h-screen w-screen bg-gray-100">
      <FullScreenMap center={[51.505, -0.09]} zoom={3} />
    </div>
  );
}
