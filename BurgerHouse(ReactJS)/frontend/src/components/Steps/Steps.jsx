import React from 'react'
import { LuCheck, LuClock } from "react-icons/lu";
import {
  StepsCompletedContent,
  StepsItem,
  StepsList,
  StepsRoot,
} from "@/components/ui/steps";

const Steps = () => {
  return (
    <StepsRoot defaultValue={1} count={3}>
        <StepsList>
        <StepsItem index={0} title="Korak 1" description="U pripremi" icon={<LuClock/>} />
        <StepsItem index={1} title="Korak 2" description="Spremno" icon={<LuCheck/>}/>
        </StepsList>
        <StepsCompletedContent>All steps are complete!</StepsCompletedContent>
    </StepsRoot>
  )
}

export default Steps;