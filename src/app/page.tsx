import CenterCloud from "./components/center-cloud";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <div className="h-[4vh]"></div>
      <CenterCloud
        items={[
          {
            text: "ip",
            description: "find your public ip",
          },
          {
            text: "password",
            description: "generate secure passwords",
          },
          {
            text: "vpn test",
            description: "check your vpn",
          },
          {
            text: "trace-route",
            description: "find network path",
          },
          {
            text: "api test",
            description: "test api endpoints",
          },
          {
            text: "encoding",
            description: "convert between formats",
          },
          {
            text: "encryption",
            description: "encrypt and decrypt data",
          },
          {
            text: "network speed",
            description: "quick local speed test (no external servers)",
          },
        ]}
      ></CenterCloud>
    </div>
  );
}
