import {useCallback} from 'react'
import {readInlineData} from 'relay-runtime'
import findStageBeforeId from '../utils/meetings/findStageBeforeId'
import graphql from 'babel-plugin-relay/macro'
import useGotoStageId from './useGotoStageId'
import {useGotoPrev_meeting} from '__generated__/useGotoPrev_meeting.graphql'

export const useGotoPrev = (meetingRef: any, gotoStageId: ReturnType<typeof useGotoStageId>) => {
  const meeting = readInlineData<useGotoPrev_meeting>(
    graphql`
      fragment useGotoPrev_meeting on NewMeeting @inline {
        localStage {
          id
        }
        phases {
          id
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  return useCallback(() => {
    const {localStage, phases} = meeting
    const {id: localStageId} = localStage
    const nextStageRes = findStageBeforeId(phases, localStageId)
    if (!nextStageRes) return
    const {
      stage: {id: nextStageId}
    } = nextStageRes
    gotoStageId(nextStageId).catch()
  }, [gotoStageId, meeting])
}

export default useGotoPrev
