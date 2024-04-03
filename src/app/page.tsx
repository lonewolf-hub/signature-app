import Image from "next/image";
import SignatureCanvas from "./core/signature/SignatureCanvas";

export default function Home() {
  return (
    <div className="bg-[#ccecf0] min-h-[800px]">
      <SignatureCanvas/>
    </div>
  );
}
