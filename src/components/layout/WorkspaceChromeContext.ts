import { createContext, useContext } from 'react'

export interface WorkspaceChrome {
  /** True when the AI workspace owns the whole viewport. */
  fullscreen: boolean
  setFullscreen: (fullscreen: boolean) => void
}

export const WorkspaceChromeContext = createContext<WorkspaceChrome>({
  fullscreen: false,
  setFullscreen: () => {},
})

export function useWorkspaceChrome(): WorkspaceChrome {
  return useContext(WorkspaceChromeContext)
}
