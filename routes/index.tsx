import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Calendar, TrendingUp, Target, Award, X } from "lucide-react";
import { cn, getUserId } from "@/lib/utils";
import { getCurrentPhase, PHASES, formatDate, type Phase } from "@/types";
import {
  readUserProfile,
  createUserProfile,
  updateUserProfile,
  readDailyTask,
  createDailyTask,
  updateDailyTask,
  readJournalEntry,
  createJournalEntry,
  readMismatchAudit,
  createMismatchAudit,
  readMicroproofEvidence,
  createMicroproofEvidence,
  listBodyProtocolWorkout,
  createBodyProtocolWorkout,
  readWeeklyCeoReview,
  createWeeklyCeoReview,
  updateWeeklyCeoReview,
  readFinalWeekDocument,
  createFinalWeekDocument,
  type UserProfileModel,
  type DailyTaskModel,
  type MismatchAuditModel,
  type BodyProtocolWorkoutModel
} from "@/lib/database";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("daily");
  const userId = getUserId();
  const today = formatDate(new Date());

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const result = await readUserProfile({ user_id: userId });
      if (!result || result.length === 0) {
        // Initialize new user
        const newProfile = await createUserProfile({
          user_id: userId,
          core_identity_statement: "I am someone who follows through, trains my body, and builds leverage daily",
          program_start_date: today,
          current_week: 1,
          current_phase: 1
        });
        return newProfile;
      }
      return result[0];
    }
  });

  // Calculate current week based on start date
  const currentWeek = profile ? Math.min(
    Math.floor((new Date().getTime() - new Date(profile.program_start_date).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1,
    12
  ) : 1;

  const currentPhase: Phase = getCurrentPhase(currentWeek);
  const phaseInfo = PHASES[currentPhase];

  // Update profile if week changed
  useEffect(() => {
    if (profile && profile.current_week !== currentWeek) {
      updateUserProfile({
        match: { user_id: userId },
        update: { current_week: currentWeek, current_phase: currentPhase }
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    }
  }, [profile, currentWeek, currentPhase, userId, queryClient]);

  // Fetch today's tasks
  const { data: dailyTask } = useQuery({
    queryKey: ["dailyTask", userId, today],
    queryFn: async () => {
      const result = await readDailyTask({ user_id: userId, date: today });
      return result?.[0] || null;
    }
  });

  // Mutations for tasks
  const toggleTaskMutation = useMutation({
    mutationFn: async (field: 'future_narrative_completed' | 'mismatch_audit_completed' | 'microproof_log_completed' | 'body_protocol_completed') => {
      if (dailyTask) {
        await updateDailyTask({
          match: { user_id: userId, date: today },
          update: { [field]: !dailyTask[field] }
        });
      } else {
        await createDailyTask({
          user_id: userId,
          date: today,
          [field]: true,
          future_narrative_completed: false,
          mismatch_audit_completed: false,
          microproof_log_completed: false,
          body_protocol_completed: false
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyTask"] });
    }
  });

  // Journal entry
  const [narrative, setNarrative] = useState("");
  const { data: journalEntry } = useQuery({
    queryKey: ["journalEntry", userId, today],
    queryFn: async () => {
      const result = await readJournalEntry({ user_id: userId, entry_date: today });
      if (result && result.length > 0) {
        setNarrative(result[0].narrative || "");
        return result[0];
      }
      return null;
    }
  });

  const saveJournalMutation = useMutation({
    mutationFn: async () => {
      await createJournalEntry({
        user_id: userId,
        entry_date: today,
        narrative,
        character_count: narrative.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntry"] });
      if (!dailyTask?.future_narrative_completed) {
        toggleTaskMutation.mutate('future_narrative_completed');
      }
    }
  });

  // Mismatch audit
  const [mismatchBehavior, setMismatchBehavior] = useState("");
  const [mismatchCorrection, setMismatchCorrection] = useState("");
  const { data: mismatchAudits } = useQuery({
    queryKey: ["mismatchAudits", userId, today],
    queryFn: async () => {
      const result = await readMismatchAudit({ user_id: userId, audit_date: today });
      return result || [];
    }
  });

  const saveMismatchMutation = useMutation({
    mutationFn: async () => {
      await createMismatchAudit({
        user_id: userId,
        audit_date: today,
        old_behavior: mismatchBehavior,
        labels: "caught",
        corrective_action: mismatchCorrection
      });
      setMismatchBehavior("");
      setMismatchCorrection("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mismatchAudits"] });
      if (!dailyTask?.mismatch_audit_completed) {
        toggleTaskMutation.mutate('mismatch_audit_completed');
      }
    }
  });

  // Microproof
  const [microproof, setMicroproof] = useState("");
  const { data: microproofEntry } = useQuery({
    queryKey: ["microproofEntry", userId, today],
    queryFn: async () => {
      const result = await readMicroproofEvidence({ user_id: userId, proof_date: today });
      if (result && result.length > 0) {
        setMicroproof(result[0].evidence || "");
        return result[0];
      }
      return null;
    }
  });

  const saveMicroproofMutation = useMutation({
    mutationFn: async () => {
      await createMicroproofEvidence({
        user_id: userId,
        proof_date: today,
        evidence: microproof
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microproofEntry"] });
      if (!dailyTask?.microproof_log_completed) {
        toggleTaskMutation.mutate('microproof_log_completed');
      }
    }
  });

  // Body protocol
  const { data: workouts } = useQuery({
    queryKey: ["workouts", userId],
    queryFn: async () => {
      const result = await listBodyProtocolWorkout({ user_id: userId });
      return result || [];
    }
  });

  const thisWeekWorkouts = workouts?.filter(w => {
    const workoutDate = new Date(w.workout_date);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return workoutDate >= weekStart;
  }) || [];

  const logWorkoutMutation = useMutation({
    mutationFn: async () => {
      await createBodyProtocolWorkout({
        user_id: userId,
        workout_date: today,
        phase: currentPhase,
        completed: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      if (!dailyTask?.body_protocol_completed) {
        toggleTaskMutation.mutate('body_protocol_completed');
      }
    }
  });

  // CEO Review
  const [ceoIdentity, setCeoIdentity] = useState("");
  const [ceoResurfacing, setCeoResurfacing] = useState("");
  const [ceoTweaks, setCeoTweaks] = useState("");
  const { data: ceoReview } = useQuery({
    queryKey: ["ceoReview", userId, currentWeek],
    queryFn: async () => {
      if (currentWeek < 5) return null;
      const result = await readWeeklyCeoReview({ user_id: userId, week_number: currentWeek });
      if (result && result.length > 0) {
        const review = result[0];
        setCeoIdentity(review.identity_reinforcement || "");
        setCeoResurfacing(review.old_identity_resurfacing || "");
        setCeoTweaks(review.system_tweaks || "");
        return review;
      }
      return null;
    },
    enabled: currentWeek >= 5
  });

  const saveCeoReviewMutation = useMutation({
    mutationFn: async () => {
      if (ceoReview) {
        await updateWeeklyCeoReview({
          match: { user_id: userId, week_number: currentWeek },
          update: {
            identity_reinforcement: ceoIdentity,
            old_identity_resurfacing: ceoResurfacing,
            system_tweaks: ceoTweaks,
            completed_date: today
          }
        });
      } else {
        await createWeeklyCeoReview({
          user_id: userId,
          week_number: currentWeek,
          identity_reinforcement: ceoIdentity,
          old_identity_resurfacing: ceoResurfacing,
          system_tweaks: ceoTweaks,
          completed_date: today
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ceoReview"] });
    }
  });

  // Final week document
  const [finalDoc, setFinalDoc] = useState("");
  const { data: finalDocument } = useQuery({
    queryKey: ["finalDocument", userId],
    queryFn: async () => {
      if (currentWeek !== 12) return null;
      const result = await readFinalWeekDocument({ user_id: userId });
      if (result && result.length > 0) {
        setFinalDoc(result[0].document || "");
        return result[0];
      }
      return null;
    },
    enabled: currentWeek === 12
  });

  const saveFinalDocMutation = useMutation({
    mutationFn: async () => {
      await createFinalWeekDocument({
        user_id: userId,
        document: finalDoc,
        completed_date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finalDocument"] });
    }
  });

  // Completion metrics
  const tasksCompleted = [
    dailyTask?.future_narrative_completed,
    dailyTask?.mismatch_audit_completed,
    dailyTask?.microproof_log_completed,
    dailyTask?.body_protocol_completed
  ].filter(Boolean).length;

  const totalTasks = 4;
  const completionPercentage = (tasksCompleted / totalTasks) * 100;

  // Calculate streak
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    // Calculate streak from past 7 days
    let count = 0;
    const checkDate = new Date();
    // This is simplified - in production you'd query the database
    setStreak(count);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* North Star Identity Display */}
      <div className="border-b border-black bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold line-clamp-2 sm:line-clamp-1">
                {profile?.core_identity_statement}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Week {currentWeek} of 12 • Phase {currentPhase}: {phaseInfo.name}
              </p>
            </div>
            <div className="text-left sm:text-right flex sm:flex-col gap-2 sm:gap-0 items-baseline sm:items-end">
              <div className="text-xl sm:text-2xl font-bold">{Math.round(completionPercentage)}%</div>
              <div className="text-xs text-zinc-600">Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 sm:mb-6 w-full grid grid-cols-3 sm:flex sm:w-auto gap-1 sm:gap-0">
            <TabsTrigger value="daily" className="text-xs sm:text-sm">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
            {currentWeek === 12 && <TabsTrigger value="final" className="text-xs sm:text-sm col-span-3 sm:col-span-1">Final</TabsTrigger>}
          </TabsList>

          {/* Daily Tab */}
          <TabsContent value="daily" className="space-y-4 sm:space-y-6">
            {/* Daily Task Dashboard */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Daily Non-Negotiables</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Complete all tasks to maintain 80% execution threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-black rounded hover:bg-zinc-50 transition-colors">
                  <Checkbox
                    checked={dailyTask?.future_narrative_completed || false}
                    onCheckedChange={() => toggleTaskMutation.mutate('future_narrative_completed')}
                    className="mt-0.5 sm:mt-0"
                  />
                  <span className={cn("flex-1 text-sm sm:text-base", dailyTask?.future_narrative_completed && "line-through text-zinc-500")}>
                    Future-Self Narrative (first-person, present-tense)
                  </span>
                  {dailyTask?.future_narrative_completed && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                </div>

                <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-black rounded hover:bg-zinc-50 transition-colors">
                  <Checkbox
                    checked={dailyTask?.mismatch_audit_completed || false}
                    onCheckedChange={() => toggleTaskMutation.mutate('mismatch_audit_completed')}
                    className="mt-0.5 sm:mt-0"
                  />
                  <span className={cn("flex-1 text-sm sm:text-base", dailyTask?.mismatch_audit_completed && "line-through text-zinc-500")}>
                    Mismatch Audit ({currentPhase >= 2 ? '2' : '1'} entries)
                  </span>
                  {dailyTask?.mismatch_audit_completed && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                </div>

                <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-black rounded hover:bg-zinc-50 transition-colors">
                  <Checkbox
                    checked={dailyTask?.microproof_log_completed || false}
                    onCheckedChange={() => toggleTaskMutation.mutate('microproof_log_completed')}
                    className="mt-0.5 sm:mt-0"
                  />
                  <span className={cn("flex-1 text-sm sm:text-base", dailyTask?.microproof_log_completed && "line-through text-zinc-500")}>
                    Microproof Evidence ({currentPhase >= 2 ? '3 bullets' : '1 sentence'})
                  </span>
                  {dailyTask?.microproof_log_completed && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                </div>

                <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-black rounded hover:bg-zinc-50 transition-colors">
                  <Checkbox
                    checked={dailyTask?.body_protocol_completed || false}
                    onCheckedChange={() => toggleTaskMutation.mutate('body_protocol_completed')}
                    className="mt-0.5 sm:mt-0"
                  />
                  <span className={cn("flex-1 text-sm sm:text-base", dailyTask?.body_protocol_completed && "line-through text-zinc-500")}>
                    Body Protocol ({phaseInfo.workoutsPerWeek}x this week)
                  </span>
                  {dailyTask?.body_protocol_completed && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                </div>

                <div className="pt-3 sm:pt-4">
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span>Daily Execution</span>
                    <span className="font-bold">{tasksCompleted}/{totalTasks}</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                  {completionPercentage >= 80 && (
                    <p className="text-xs text-green-700 mt-2">✓ Above 80% threshold</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Future-Self Narrative Journal */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Future-Self Narrative</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Write in first-person, present-tense. {currentPhase === 1 ? 'Daily' : currentPhase === 2 ? '5x per week' : '3x per week'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="I am someone who..."
                  className="min-h-24 sm:min-h-32 font-mono text-sm sm:text-base"
                />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <span className="text-xs sm:text-sm text-zinc-600">{narrative.length} characters</span>
                  <Button onClick={() => saveJournalMutation.mutate()} disabled={!narrative.trim()} className="w-full sm:w-auto">
                    {journalEntry ? 'Update Entry' : 'Save Entry'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mismatch Audit Logger */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Mismatch Audit</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Log old behavior patterns caught and corrective actions taken
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <Input
                    value={mismatchBehavior}
                    onChange={(e) => setMismatchBehavior(e.target.value)}
                    placeholder="Old behavior pattern caught..."
                    className="text-sm sm:text-base"
                  />
                  <Input
                    value={mismatchCorrection}
                    onChange={(e) => setMismatchCorrection(e.target.value)}
                    placeholder="Corrective action taken..."
                    className="text-sm sm:text-base"
                  />
                  <Button
                    onClick={() => saveMismatchMutation.mutate()}
                    disabled={!mismatchBehavior.trim() || !mismatchCorrection.trim()}
                    className="w-full"
                  >
                    Log Mismatch
                  </Button>
                </div>

                {mismatchAudits && mismatchAudits.length > 0 && (
                  <div className="mt-3 sm:mt-4 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold">Today's Logs ({mismatchAudits.length}):</p>
                    {mismatchAudits.map((audit, idx) => (
                      <div key={idx} className="p-2 sm:p-3 border border-zinc-200 rounded text-xs sm:text-sm">
                        <p className="font-semibold">{audit.old_behavior}</p>
                        <p className="text-zinc-600 mt-1">→ {audit.corrective_action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Microproof Evidence Tracker */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Microproof Evidence</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Nightly logging of proof of identity progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Textarea
                  value={microproof}
                  onChange={(e) => setMicroproof(e.target.value)}
                  placeholder={currentPhase >= 2 ? "• Bullet 1\n• Bullet 2\n• Bullet 3" : "One sentence of proof..."}
                  className="min-h-20 sm:min-h-24 text-sm sm:text-base"
                />
                <Button onClick={() => saveMicroproofMutation.mutate()} disabled={!microproof.trim()} className="w-full">
                  {microproofEntry ? 'Update Proof' : 'Save Proof'}
                </Button>
              </CardContent>
            </Card>

            {/* Body Protocol Tracker */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Body Protocol</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Training {phaseInfo.workoutsPerWeek}x per week • Never miss twice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Button onClick={() => logWorkoutMutation.mutate()} className="w-full">
                  Log Today's Workout
                </Button>
                <div className="flex gap-1.5 sm:gap-2">
                  {[...Array(7)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = formatDate(date);
                    const hasWorkout = workouts?.some(w => w.workout_date === dateStr);
                    return (
                      <div key={i} className="flex-1 text-center">
                        <div className={cn(
                          "w-full h-10 sm:h-12 border-2 rounded flex items-center justify-center",
                          hasWorkout ? "bg-black text-white border-black" : "border-zinc-300"
                        )}>
                          {hasWorkout ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />}
                        </div>
                        <p className="text-[10px] sm:text-xs mt-1">{['S','M','T','W','T','F','S'][date.getDay()]}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs sm:text-sm text-center">
                  <span className="font-bold">{thisWeekWorkouts.length}</span> / {phaseInfo.workoutsPerWeek} this week
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="space-y-4 sm:space-y-6">
            {currentWeek >= 5 ? (
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Weekly CEO Review</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Week {currentWeek} reflection and optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold">What identity pattern did I reinforce this week?</label>
                    <Textarea
                      value={ceoIdentity}
                      onChange={(e) => setCeoIdentity(e.target.value)}
                      className="mt-2 text-sm sm:text-base"
                      placeholder="I reinforced..."
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold">When did the old identity try to resurface?</label>
                    <Textarea
                      value={ceoResurfacing}
                      onChange={(e) => setCeoResurfacing(e.target.value)}
                      className="mt-2 text-sm sm:text-base"
                      placeholder="The old pattern showed up when..."
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold">One system tweak for next week:</label>
                    <Textarea
                      value={ceoTweaks}
                      onChange={(e) => setCeoTweaks(e.target.value)}
                      className="mt-2 text-sm sm:text-base"
                      placeholder="Next week I will..."
                    />
                  </div>
                  <Button onClick={() => saveCeoReviewMutation.mutate()} className="w-full">
                    {ceoReview ? 'Update Review' : 'Save Review'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  <p className="text-sm sm:text-base text-zinc-500">Weekly CEO Reviews unlock in Week 5</p>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2">{5 - currentWeek} weeks to go</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Phase Progress</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Current phase: {phaseInfo.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span>Phase {currentPhase} Completion</span>
                    <span>{Math.min(currentWeek - (phaseInfo.weeks[0] - 1), phaseInfo.weeks.length)} / {phaseInfo.weeks.length} weeks</span>
                  </div>
                  <Progress value={(Math.min(currentWeek - (phaseInfo.weeks[0] - 1), phaseInfo.weeks.length) / phaseInfo.weeks.length) * 100} />
                </div>

                <div>
                  <p className="text-sm sm:text-base font-semibold mb-2">Phase Goals:</p>
                  <ul className="space-y-2">
                    {phaseInfo.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Consistency Visualization</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Last 7 days execution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {[...Array(7)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    return (
                      <div key={i} className="text-center">
                        <div className="w-full aspect-square border-2 border-black rounded" />
                        <p className="text-[10px] sm:text-xs mt-1">{date.getDate()}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-xs sm:text-sm mt-3 sm:mt-4 text-zinc-600">
                  Miss a day? No self-talk, just resume.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span>Program Completion</span>
                    <span>{currentWeek} / 12 weeks</span>
                  </div>
                  <Progress value={(currentWeek / 12) * 100} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Final Tab (Week 12 only) */}
          {currentWeek === 12 && (
            <TabsContent value="final" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">The Version of Me That No Longer Exists</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Final week exercise: Write your decommissioning document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Textarea
                    value={finalDoc}
                    onChange={(e) => setFinalDoc(e.target.value)}
                    className="min-h-48 sm:min-h-64 font-mono text-sm sm:text-base"
                    placeholder="The person I used to be no longer exists. Here's who they were and why they're gone..."
                  />
                  <Button onClick={() => saveFinalDocMutation.mutate()} disabled={!finalDoc.trim()} className="w-full">
                    {finalDocument ? 'Update Document' : 'Save Document'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
