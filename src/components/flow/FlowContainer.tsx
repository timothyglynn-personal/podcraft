"use client";

import { useFlow } from "./FlowContext";
import WelcomePage from "./WelcomePage";
import TopicPage from "./TopicPage";
import StylePage from "./StylePage";
import SuggestedSourcesPage from "./SuggestedSourcesPage";
import ExtraSourcesPage from "./ExtraSourcesPage";
import GeneratingPage from "./GeneratingPage";
import PlayerPage from "./PlayerPage";
import ProfileView from "../ProfileView";
import { FlowStep } from "@/lib/types";

const STEP_COMPONENTS: Record<FlowStep, React.FC> = {
  welcome: WelcomePage,
  topic: TopicPage,
  style: StylePage,
  "suggested-sources": SuggestedSourcesPage,
  "extra-sources": ExtraSourcesPage,
  generating: GeneratingPage,
  player: PlayerPage,
};

export default function FlowContainer() {
  const { state, showProfile, setShowProfile } = useFlow();
  const Component = STEP_COMPONENTS[state.step];

  return (
    <div className="min-h-screen">
      {/* Persistent profile button — visible on all pages */}
      {state.userName && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full bg-surface-card border border-brand-500/20 flex items-center justify-center hover:bg-surface-hover transition-colors shadow-lg"
            title="Your profile"
          >
            <span className="text-sm font-medium text-brand-400">
              {state.userName.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>
      )}
      <div key={state.step} className="animate-fade-in">
        <Component />
      </div>
      {showProfile && <ProfileView onClose={() => setShowProfile(false)} />}
    </div>
  );
}
