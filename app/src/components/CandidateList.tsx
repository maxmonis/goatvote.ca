import {Dispatch, SetStateAction} from "react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd"
import {TransitionGroup} from "react-transition-group"

import DeleteIcon from "@mui/icons-material/Delete"
import Avatar from "@mui/material/Avatar"
import AvatarGroup from "@mui/material/AvatarGroup"
import Box from "@mui/material/Box"
import Collapse from "@mui/material/Collapse"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import MenuItem from "@mui/material/MenuItem"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import Zoom from "@mui/material/Zoom"

import {getDisplayText, getInitials} from "../shared/helpers"
import {Candidate} from "../shared/models"

export default function CandidateList({
  candidates,
  handleClick,
  isAvatarGroup,
  setCandidates,
  size = "lg",
  showIndex = true,
}: {
  candidates: Candidate[]
} & (
  | {
      handleClick?: never
      isAvatarGroup: true
      setCandidates?: never
      showIndex?: never
      size?: never
    }
  | {
      handleClick?: never
      isAvatarGroup?: never
      setCandidates: Dispatch<SetStateAction<typeof candidates>>
      showIndex?: never
      size?: never
    }
  | {
      handleClick?: (candidate: Candidate) => void
      isAvatarGroup?: never
      setCandidates?: never
      showIndex?: boolean
      size?: never
    }
  | {
      handleClick?: never
      isAvatarGroup?: never
      setCandidates?: never
      showIndex?: never
      size?: "sm" | "lg"
    }
)) {
  // case 1: nothing to display
  if (candidates.length === 0) return <></>

  // case 2: avatar group
  if (isAvatarGroup)
    return (
      <AvatarGroup
        spacing="small"
        sx={{
          "> *": {
            height: "min(20vw, 4rem) !important",
            width: "min(20vw, 4rem) !important",
          },
        }}
      >
        {candidates.map(({text, image}) => (
          <Tooltip
            arrow
            key={text}
            placement="bottom"
            title={getDisplayText(text)}
            TransitionComponent={Zoom}
          >
            {image ? (
              <Avatar alt={text} src={image} />
            ) : (
              <Avatar>{getInitials(text)}</Avatar>
            )}
          </Tooltip>
        ))}
      </AvatarGroup>
    )

  // case 3: items can be reordered/deleted
  if (setCandidates)
    return (
      <DragDropContext {...{onDragEnd}}>
        <Droppable droppableId="CandidateList">
          {({droppableProps, innerRef: droppableRef, placeholder}) => (
            <List ref={droppableRef} sx={{mx: "auto"}} {...droppableProps}>
              <TransitionGroup>
                {candidates.map(({image, text}, i) => (
                  <Collapse key={text}>
                    <Draggable draggableId={text} index={i}>
                      {({
                        draggableProps,
                        dragHandleProps,
                        innerRef: draggableRef,
                      }) => (
                        <ListItem
                          sx={{
                            bgcolor: "background.paper",
                            border: 1,
                            display: "flex",
                            gap: 4,
                            justifyContent: "space-between",
                            mx: "auto",
                            textAlign: "left",
                            ...(i > 0 ? {mt: "-1px"} : {}),
                          }}
                          ref={draggableRef}
                          {...draggableProps}
                        >
                          <Box
                            alignItems="center"
                            display="flex"
                            gap={3}
                            textAlign="left"
                            {...dragHandleProps}
                          >
                            <Typography variant="h5">{i + 1}.</Typography>
                            <Box
                              display="flex"
                              flexShrink={0}
                              justifyContent="center"
                              sx={{
                                width: {
                                  xs: 45,
                                  sm: 60,
                                },
                              }}
                            >
                              <CandidateAvatar size="lg" {...{image, text}} />
                            </Box>
                            <Typography variant="h6">
                              {getDisplayText(text)}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              onClick={() =>
                                setCandidates(
                                  candidates.filter(c => c.text !== text),
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                      )}
                    </Draggable>
                  </Collapse>
                ))}
                {placeholder}
              </TransitionGroup>
            </List>
          )}
        </Droppable>
      </DragDropContext>
    )

  // case 4: items are actionable, displaying index is optional
  if (handleClick)
    return (
      <List>
        {candidates.map((candidate, i) => {
          const {image, text} = candidate
          return (
            <MenuItem key={text} onClick={() => handleClick(candidate)}>
              <Box
                alignItems="center"
                display="flex"
                flexShrink={0}
                gap={2}
                justifyContent="center"
                sx={{width: {xs: 45, sm: 60}}}
              >
                {showIndex && <Typography>{i + 1}.</Typography>}
                <CandidateAvatar {...{image, text}} />
              </Box>
              <Typography sx={{ml: 2}}>{getDisplayText(text)}</Typography>
            </MenuItem>
          )
        })}
      </List>
    )

  // case 5 (default): ordered list, no interactions
  return (
    <List>
      <TransitionGroup>
        {candidates.map(({image, text}, i) => (
          <Collapse key={text}>
            <ListItem key={text}>
              <Box
                alignItems="center"
                display="flex"
                flexShrink={0}
                gap={2}
                mr={size === "lg" ? 4 : 0}
                justifyContent="center"
                sx={{width: {xs: 60, sm: 80}}}
              >
                <Typography variant={size === "lg" ? "h5" : "body1"}>
                  {i + 1}.
                </Typography>
                <CandidateAvatar {...{image, size, text}} />
              </Box>
              <Typography variant={size === "lg" ? "h6" : "body1"}>
                {getDisplayText(text)}
              </Typography>
            </ListItem>
          </Collapse>
        ))}
      </TransitionGroup>
    </List>
  )

  function onDragEnd({destination, draggableId, source}: DropResult) {
    if (destination && destination.index !== source.index) {
      const textList = candidates.map(o => o.text)
      textList.splice(source.index, 1)
      textList.splice(destination.index, 0, draggableId)
      const updatedCandidates = []
      for (const text of textList) {
        for (const candidate of candidates) {
          if (candidate.text === text) {
            updatedCandidates.push(candidate)
          }
        }
      }
      setCandidates?.(updatedCandidates)
    }
  }
}

function CandidateAvatar({
  image,
  size = "sm",
  text,
}: Candidate & {size?: "sm" | "lg"}) {
  switch (size) {
    case "sm":
      return image ? (
        <Avatar
          alt={text}
          src={image}
          sx={{
            height: 40,
            maxWidth: 30,
            width: "auto",
          }}
          variant="rounded"
        />
      ) : (
        <Avatar
          sx={{
            height: 30,
            my: 1,
            px: 4,
            width: 30,
          }}
          variant="rounded"
        >
          {getInitials(text)}
        </Avatar>
      )
    case "lg":
      return image ? (
        <Avatar
          alt={text}
          src={image}
          sx={{
            height: {
              xs: 60,
              sm: 80,
            },
            maxWidth: {
              xs: 45,
              sm: 60,
            },
            width: "auto",
          }}
          variant="rounded"
        />
      ) : (
        <Avatar
          alt={text}
          sx={{
            height: {
              xs: 40,
              sm: 50,
            },
            my: {
              xs: 2,
              sm: 3,
            },
            width: {
              xs: 40,
              sm: 50,
            },
          }}
          variant="rounded"
        >
          {getInitials(text)}
        </Avatar>
      )
  }
}
