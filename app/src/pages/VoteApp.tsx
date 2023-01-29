import {FormEvent, SyntheticEvent, useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useTranslation} from "react-i18next"
import {
  createSearchParams,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom"

import axios from "axios"

import ClearIcon from "@mui/icons-material/Clear"
import SearchIcon from "@mui/icons-material/Search"
import LoadingButton from "@mui/lab/LoadingButton"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import InputAdornment from "@mui/material/InputAdornment"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import Snackbar from "@mui/material/Snackbar"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import CandidateList from "../components/CandidateList"
import {ButtonLink} from "../components/CTA"
import {auth} from "../firebase"
import useAddVote from "../hooks/useAddVote"
import useDebounce from "../hooks/useDebounce"
import useUpdateVote from "../hooks/useUpdateVote"
import useVotes from "../hooks/useVotes"
import {categories} from "../shared/constants"
import {
  getCapitalizedCategory,
  getSubcategoryText,
  getTimeframeText,
  isCategory,
  isSubcategory,
  isTimeframe,
} from "../shared/helpers"
import {Candidate, Category, QueryResponse} from "../shared/models"
import {localVote} from "../utils/storage"

export default function VoteApp() {
  const {t} = useTranslation()
  const navigate = useNavigate()

  const [user, isLoadingUser] = useAuthState(auth)
  const params = useParams()
  const {category, subcategory, timeframe} = params

  const mutationParams = {
    category,
    onSuccess,
    subcategory,
    timeframe,
    userId: user?.uid,
  }
  const {mutate: addVote, isLoading: isAdding} = useAddVote(mutationParams)
  const {mutate: updateVote, isLoading: isUpdating} =
    useUpdateVote(mutationParams)
  const isSubmitting = isAdding || isUpdating

  const {data: userVotes, isLoading: isLoadingUserVotes} = useVotes({
    creatorId: user?.uid,
  })
  const {data: allVotes, isLoading: isLoadingAllVotes} = useVotes({
    category,
    limit: 3,
    omitCreatorId: user?.uid,
    subcategory,
    timeframe,
  })
  const {votes} = allVotes ?? {votes: []}
  const isLoading = isLoadingUser || isLoadingUserVotes

  const [appliedQuery, setAppliedQuery] = useState("")
  const [availableOptions, setAvailableOptions] = useState<
    QueryResponse["results"]
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<
    typeof availableOptions
  >([])
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [snackbarText, setSnackbarText] = useState("")
  const [wikiQuery, setWikiQuery] = useState("")

  const debouncedQuery = useDebounce(wikiQuery, 700)

  const storageKey = getStorageKey()

  useEffect(() => {
    if (debouncedQuery.length > 3 && availableOptions.length === 0) {
      fetchOptions()
    }
    //eslint-disable-next-line
  }, [debouncedQuery])

  useEffect(() => {
    resetSearch()
    setSelectedOptions(storageKey ? localVote.get(storageKey) ?? [] : [])
    setIsEditing(!isLoading && !userVote)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, user, userVotes])

  useEffect(() => {
    if (storageKey) {
      localVote.set(selectedOptions, storageKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions])

  const isValidCategory = isCategory(category)
  if (!isValidCategory) return <Navigate replace to="/" />

  const {subcategories, timeframes} = categories[category]

  const isValidSubcategory = isSubcategory(subcategory, category)
  const isValidTimeframe = isTimeframe(timeframe, category)

  const isValid = isValidCategory && isValidSubcategory && isValidTimeframe

  if (!isValid)
    return (
      <Navigate
        replace
        to={`/${category}/${
          isValidSubcategory ? subcategory : subcategories[0]
        }/${isValidTimeframe ? timeframe : timeframes[0]}`}
      />
    )

  const userVote = userVotes?.votes?.find(
    vote =>
      vote.category === category &&
      vote.subcategory === subcategory &&
      vote.timeframe === timeframe,
  )

  const isListFull = selectedOptions.length > 9

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      gap="max(1.5rem, 5vh)"
      justifyContent="center"
      m="auto"
      maxWidth="md"
      px={6}
      textAlign="center"
    >
      <Snackbar autoHideDuration={3000} open={isSnackbarOpen} {...{onClose}}>
        <Alert severity="error" sx={{alignItems: "center", display: "flex"}}>
          {snackbarText}
          {appliedQuery && (
            <Button
              onClick={resetSearch}
              size="small"
              sx={{ml: 3}}
              variant="outlined"
            >
              {t("Clear query")}
            </Button>
          )}
        </Alert>
      </Snackbar>
      <Box>
        <Select
          onChange={e => {
            const category = e.target.value
            if (isCategory(category)) {
              navigate(
                `/${category}/${
                  isSubcategory(subcategory, category)
                    ? subcategory
                    : categories[category].subcategories[0]
                }/${
                  isTimeframe(timeframe, category)
                    ? timeframe
                    : categories[category].timeframes[0]
                }`,
              )
            }
          }}
          sx={{
            display: "flex",
            flex: 1,
            fontSize: 32,
          }}
          value={category}
        >
          {Object.values(Category).map(category => (
            <MenuItem key={category} value={category}>
              {getCapitalizedCategory(category)}
            </MenuItem>
          ))}
        </Select>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="center"
          mt={2}
        >
          <Select
            onChange={e =>
              navigate(`/${category}/${e.target.value}/${timeframe}`)
            }
            sx={{
              display: "flex",
              flex: 1,
              fontSize: 20,
            }}
            value={subcategory}
          >
            {subcategories.map(subcategory => (
              <MenuItem key={subcategory} value={subcategory}>
                {getSubcategoryText(subcategory)}
              </MenuItem>
            ))}
          </Select>
          <Select
            onChange={e =>
              navigate(`/${category}/${subcategory}/${e.target.value}`)
            }
            sx={{
              display: "flex",
              flex: 1,
              fontSize: 20,
            }}
            value={timeframe}
          >
            {timeframes.map(timeframe => (
              <MenuItem key={timeframe} value={timeframe}>
                {getTimeframeText(timeframe)}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <Box
        alignItems="flex-start"
        columnGap={10}
        display="grid"
        gridTemplateColumns={{
          sm: "1fr",
          md: user ? "1fr 1fr" : "1fr",
        }}
        rowGap={50}
      >
        {isLoadingUser ? (
          <CircularProgress sx={{mx: "auto"}} />
        ) : user ? (
          <Box
            display="flex"
            flexDirection="column"
            gap={6}
            justifyContent="center"
            mx="auto"
            textAlign="center"
          >
            {isEditing ? (
              <>
                <Typography variant="h3">{t("Cast your vote!")}</Typography>
                <Box maxWidth="xs" mx="auto">
                  {!isListFull && (
                    <>
                      <Box
                        alignItems="center"
                        component="form"
                        display="flex"
                        gap={1}
                        noValidate
                        {...{onSubmit}}
                      >
                        <TextField
                          autoComplete="off"
                          autoFocus
                          error={
                            Boolean(appliedQuery) &&
                            appliedQuery === wikiQuery &&
                            availableOptions.length === 0
                          }
                          inputProps={{
                            maxLength: 25,
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {wikiQuery ? (
                                  <ClearIcon
                                    onClick={resetSearch}
                                    sx={{cursor: "pointer"}}
                                  />
                                ) : (
                                  <SearchIcon />
                                )}
                              </InputAdornment>
                            ),
                          }}
                          helperText={t(
                            availableOptions.length
                              ? "Showing results for '{{term}}'"
                              : appliedQuery && appliedQuery === wikiQuery
                              ? "No results for '{{term}}'"
                              : "",
                            {term: appliedQuery},
                          )}
                          label={t("Search players")}
                          onChange={e => setWikiQuery(e.target.value)}
                          value={wikiQuery}
                        />
                      </Box>
                      {isSearching ? (
                        <CircularProgress sx={{mt: 6}} />
                      ) : (
                        <CandidateList
                          candidates={availableOptions}
                          showIndex={false}
                          {...{handleClick}}
                        />
                      )}
                    </>
                  )}
                </Box>
                <CandidateList
                  candidates={selectedOptions}
                  setCandidates={setSelectedOptions}
                />
                {selectedOptions.length > 0 && (
                  <Box display="flex" gap={4} mt={10}>
                    <LoadingButton
                      loading={isSubmitting}
                      onClick={handleSave}
                      size="large"
                      sx={{flexGrow: 1}}
                      variant="contained"
                    >
                      {t("Save")}
                    </LoadingButton>
                    {userVote && (
                      <Button onClick={() => setIsEditing(false)}>
                        {t("Cancel")}
                      </Button>
                    )}
                  </Box>
                )}
              </>
            ) : userVote ? (
              <>
                <Typography variant="h3">{t("Thanks for voting!")}</Typography>
                <Box
                  alignItems="center"
                  display="flex"
                  flexDirection="column"
                  gap={10}
                >
                  {userVote.ballot[0].image && (
                    <Box
                      borderRadius={2}
                      component="img"
                      maxWidth="15rem"
                      src={userVote.ballot[0].image}
                    />
                  )}
                  <CandidateList candidates={userVote.ballot} />
                  <Button
                    onClick={handleEditClick}
                    sx={{maxWidth: "fit-content"}}
                  >
                    {t("Update")}
                  </Button>
                </Box>
              </>
            ) : null}
          </Box>
        ) : null}
        <Box maxWidth="40rem" textAlign="center">
          <Typography variant="h3">{t("Recent Votes")}</Typography>
          {isLoadingAllVotes ? (
            <CircularProgress />
          ) : votes.length ? (
            <Box
              display="grid"
              gap={10}
              justifyContent="center"
              maxWidth="lg"
              mt={6}
            >
              {votes.map(
                ({
                  ballot,
                  category,
                  creatorId,
                  creatorName,
                  subcategory,
                  timeframe,
                }) => (
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    key={category + subcategory + timeframe + creatorId}
                    maxWidth="min(20rem, 100%)"
                  >
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Typography variant="h6">{creatorName}</Typography>
                    </Box>
                    {isEditing ? (
                      <CandidateList candidates={ballot} {...{handleClick}} />
                    ) : (
                      <CandidateList candidates={ballot} size="sm" />
                    )}
                  </Box>
                ),
              )}
            </Box>
          ) : (
            <Typography sx={{mt: 6}} variant="h5">
              {t(
                userVote
                  ? "No one else has voted in this category"
                  : "No votes in category",
              )}
            </Typography>
          )}
          <ButtonLink
            sx={{mt: 10}}
            to={{
              pathname: "/",
              search: `?${createSearchParams({
                category,
                subcategory,
                timeframe,
              })}`,
            }}
            variant="outlined"
          >
            {t("Vote List")}
          </ButtonLink>
        </Box>
      </Box>
    </Box>
  )

  function handleEditClick() {
    if (userVote) setSelectedOptions(userVote.ballot)
    setIsEditing(true)
  }

  function getStorageKey() {
    if (
      user &&
      isCategory(category) &&
      isSubcategory(subcategory, category) &&
      isTimeframe(timeframe, category)
    ) {
      return [user.uid, category, subcategory, timeframe].join("_")
    }
    return null
  }

  function resetSearch() {
    setAppliedQuery("")
    setAvailableOptions([])
    setSnackbarText("")
    setIsSnackbarOpen(false)
    setWikiQuery("")
  }

  function onClose(_event?: SyntheticEvent | Event, reason?: string) {
    if (reason !== "clickaway") setIsSnackbarOpen(false)
  }

  function handleClick(candidate: Candidate) {
    if (!isEditing) return

    const {text} = candidate

    if (selectedOptions.some(s => s.text === text)) {
      const snackbarText = t("{{text}} is already in the list", {text})
      setSnackbarText(snackbarText)
      setIsSnackbarOpen(true)
    } else {
      if (!isListFull) {
        setSelectedOptions([...selectedOptions, candidate])
      }
      const selectedOption = availableOptions.find(o => o.text === text)
      if (selectedOption) {
        resetSearch()
      }
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (wikiQuery.length > 2) fetchOptions()
  }

  async function fetchOptions() {
    if (isSearching || wikiQuery.length < 3) return
    setIsSearching(true)

    try {
      const {data} = await axios.get<QueryResponse>(`/api/search`, {
        params: {category, subcategory, term: wikiQuery, timeframe},
      })

      setAppliedQuery(data.term)
      setAvailableOptions(data.results)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSave() {
    if (userVote) return handleUpdate()
    if (isSubmitting || !user?.displayName || !isValid) return

    const {displayName: creatorName, uid: creatorId} = user
    addVote({
      vote: {
        category,
        creatorId,
        creatorName,
        ballot: selectedOptions.slice(0, 10),
        subcategory,
        timeframe,
      },
    })
  }

  async function handleUpdate() {
    if (isSubmitting || !user || !userVote || !isValid) return

    if (!hasVoteChanged()) return setIsEditing(false)

    updateVote({ballot: selectedOptions, id: userVote._id})
  }

  function onSuccess() {
    resetSearch()
    setSelectedOptions([])
  }

  function hasVoteChanged() {
    if (selectedOptions.length !== userVote?.ballot.length) return true

    for (let i = 0; i < selectedOptions.length; i++) {
      if (selectedOptions[i].text !== userVote?.ballot[i].text) {
        return true
      }
    }

    return false
  }
}
