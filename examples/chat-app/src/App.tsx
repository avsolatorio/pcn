import { useMemo, useEffect } from "react";
import { ClaimsManager, createDataPointExtractor } from "@pcn/core";
import { ClaimsProvider, useClaimsManager } from "@pcn/ui";
import { MessageWithClaims } from "./MessageWithClaims";

/** Simulated get_data tool result (e.g. from Data360). */
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
  const manager = useClaimsManager();

  useEffect(() => {
    if (!manager) return;
    manager.ingest("get_data", MOCK_GET_DATA_RESULT);
  }, [manager]);

  return (
    <div className="chat">
      <header className="chat-header">
        <h1>PCN Example</h1>
        <p>Numbers with ✓ are verified against tool data; ⚠ are pending.</p>
      </header>
      <div className="message-list">
        <MessageWithClaims />
      </div>
    </div>
  );
}

export function App() {
  const manager = useMemo(() => {
    const m = new ClaimsManager();
    m.registerExtractor(
      "get_data",
      createDataPointExtractor({
        dataKey: "data",
        claimIdKey: "claim_id",
        valueKey: "OBS_VALUE",
        countryKey: "REF_AREA",
        dateKey: "TIME_PERIOD",
      })
    );
    return m;
  }, []);

  return (
    <ClaimsProvider manager={manager}>
      <ChatContent />
    </ClaimsProvider>
  );
}
