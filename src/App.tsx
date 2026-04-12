import { AppLayout } from "./components/layout/AppLayout";
import { ChatContainer } from "./components/chat/ChatContainer";
import cvData from "../data/cv-data.json";
import type { CvData } from "./lib/types";

const typedCvData = cvData as CvData;

function App() {
  return (
    <AppLayout profile={typedCvData.profile} skills={typedCvData.skills}>
      <ChatContainer />
    </AppLayout>
  );
}

export default App;
