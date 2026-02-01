import { Data360ClaimsProvider, DATA360_GET_DATA_TOOL } from "@pcn/data360";
import { IngestToolOutput } from "@pcn/ui";
import { MessageWithClaims } from "./MessageWithClaims";

/** Simulated Data360 get_data tool result. */
const MOCK_GET_DATA_RESULT = {
  data: [
    {
      claim_id: "claim-poverty-kenya-2022",
      OBS_VALUE: "0.42",
      REF_AREA: "KEN",
      TIME_PERIOD: "2022",
    },
    {
      claim_id: "claim-gdp-per-capita-kenya-2022",
      OBS_VALUE: "2100",
      REF_AREA: "KEN",
      TIME_PERIOD: "2022",
    },
  ],
};

function ChatContent() {
  return (
    <div className="chat">
      <header className="chat-header">
        <h1>PCN Example (Data360 preset)</h1>
        <p>Numbers with ✓ are verified against tool data; ⚠ are pending.</p>
      </header>
      <div className="message-list">
        <MessageWithClaims />
      </div>
    </div>
  );
}

export function App() {
  return (
    <Data360ClaimsProvider>
      <IngestToolOutput toolName={DATA360_GET_DATA_TOOL} output={MOCK_GET_DATA_RESULT}>
        <ChatContent />
      </IngestToolOutput>
    </Data360ClaimsProvider>
  );
}
