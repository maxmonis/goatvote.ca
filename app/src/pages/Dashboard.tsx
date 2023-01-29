import {useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useTranslation} from "react-i18next"
import {
  createSearchParams,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import MenuItem from "@mui/material/MenuItem"
import Select, {SelectChangeEvent} from "@mui/material/Select"
import Typography from "@mui/material/Typography"

import CandidateList from "../components/CandidateList"
import {ButtonLink, TextLink} from "../components/CTA"
import {auth} from "../firebase"
import useVotes from "../hooks/useVotes"
import {categories} from "../shared/constants"
import {
  getCapitalizedCategory,
  getCapitalizedSubcategory,
  getCapitalizedTimeframe,
  getSubcategoryText,
  getTimeframeText,
  isCategory,
  isSubcategory,
  isTimeframe,
} from "../shared/helpers"
import {Category} from "../shared/models"

export default function Dashboard() {
  const {t} = useTranslation()

  const [searchParams] = useSearchParams()
  const category = searchParams.get("category") ?? undefined
  const creatorId = searchParams.get("creatorId") ?? undefined
  const subcategory = searchParams.get("subcategory") ?? undefined
  const timeframe = searchParams.get("timeframe") ?? undefined

  const {pathname} = useLocation()
  const navigate = useNavigate()

  const [pageCount, setPageCount] = useState(1)
  useEffect(() => {
    setPageCount(1)
  }, [category, creatorId, subcategory, timeframe])

  const paramKeys = Object.keys(Object.fromEntries(searchParams))
  if (paramKeys.some(isInvalidParamKey)) {
    for (const key of paramKeys) {
      if (isInvalidParamKey(key)) {
        searchParams.delete(key)
      }
    }
    return (
      <Navigate
        replace
        to={{pathname, search: `?${createSearchParams(searchParams)}`}}
      />
    )
  }

  if (category) {
    if (!isCategory(category)) {
      searchParams.delete("category")
      if (subcategory && !isSubcategory(subcategory)) {
        searchParams.delete("subcategory")
        if (timeframe && !isTimeframe(timeframe)) {
          searchParams.delete("timeframe")
        }
      }
      return (
        <Navigate
          replace
          to={{pathname, search: `?${createSearchParams(searchParams)}`}}
        />
      )
    }
    if (subcategory && !isSubcategory(subcategory, category)) {
      searchParams.delete("subcategory")
      if (timeframe && !isTimeframe(timeframe, category)) {
        searchParams.delete("timeframe")
      }
      return (
        <Navigate
          replace
          to={{pathname, search: `?${createSearchParams(searchParams)}`}}
        />
      )
    }
    if (timeframe && !isTimeframe(timeframe, category)) {
      searchParams.delete("timeframe")
      return (
        <Navigate
          replace
          to={{pathname, search: `?${createSearchParams(searchParams)}`}}
        />
      )
    }
  }

  if (subcategory && !isSubcategory(subcategory)) {
    searchParams.delete("subcategory")
    if (timeframe && !isTimeframe(timeframe)) {
      searchParams.delete("timeframe")
    }
    return (
      <Navigate
        replace
        to={{pathname, search: `?${createSearchParams(searchParams)}`}}
      />
    )
  }
  if (timeframe && !isTimeframe(timeframe)) {
    searchParams.delete("timeframe")
    return (
      <Navigate
        replace
        to={{pathname, search: `?${createSearchParams(searchParams)}`}}
      />
    )
  }

  const allSubcategories = new Set<string>()
  const allTimeframes = new Set<string>()
  for (const {subcategories, timeframes} of Object.values(categories)) {
    for (const subcategory of subcategories) {
      allSubcategories.add(subcategory)
    }
    for (const timeframe of timeframes) {
      allTimeframes.add(timeframe)
    }
  }
  const subcategories = isCategory(category)
    ? categories[category].subcategories
    : Array.from(allSubcategories)

  const timeframes = isCategory(category)
    ? categories[category].timeframes
    : Array.from(allTimeframes)

  const voteRoute = `/${category || Object.keys(categories)[0]}/${
    isCategory(category) && !isSubcategory(subcategory, category)
      ? subcategories[0]
      : subcategory || subcategories[0]
  }/${
    isCategory(category) && !isTimeframe(timeframe, category)
      ? timeframes[0]
      : timeframe || timeframes[0]
  }`

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      gap={6}
      px={4}
    >
      <Box textAlign="center">
        <Select
          labelId="category"
          onChange={handleCategoryUpdate}
          sx={{
            display: "flex",
            flex: 1,
            fontSize: 32,
          }}
          value={category || "Any Sport"}
        >
          <MenuItem value="Any Sport">{t("Any Sport")}</MenuItem>
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
            onChange={handleSubcategoryUpdate}
            sx={{
              display: "flex",
              flex: 1,
              fontSize: 20,
            }}
            value={subcategory || "Any Subcategory"}
          >
            <MenuItem value="Any Subcategory">{t("Any Subcategory")}</MenuItem>
            {subcategories.map(subcategory => (
              <MenuItem key={subcategory} value={subcategory}>
                {getCapitalizedSubcategory(subcategory)}
              </MenuItem>
            ))}
          </Select>
          <Select
            onChange={handleTimeframeUpdate}
            sx={{
              display: "flex",
              flex: 1,
              fontSize: 20,
            }}
            value={timeframe || "Any Timeframe"}
          >
            <MenuItem value="Any Timeframe">{t("Any Timeframe")}</MenuItem>
            {timeframes.map(timeframe => (
              <MenuItem key={timeframe} value={timeframe}>
                {getCapitalizedTimeframe(timeframe)}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      {Array.from(Array(pageCount)).map((_, i) => (
        <PaginatedVoteSection
          key={i}
          isLast={i + 1 === pageCount}
          page={i + 1}
          params={{category, creatorId, subcategory, timeframe}}
          {...{clearCreatorId, loadNextPage, voteRoute}}
        />
      ))}
    </Box>
  )

  function isInvalidParamKey(key: string) {
    return !["category", "creatorId", "subcategory", "timeframe"].includes(key)
  }

  function loadNextPage() {
    setPageCount(pageCount + 1)
  }

  function clearCreatorId() {
    if (creatorId) {
      searchParams.delete("creatorId")
      navigate({
        pathname,
        search: `?${createSearchParams(searchParams)}`,
      })
    }
  }

  function handleCategoryUpdate({
    target: {value: category},
  }: SelectChangeEvent<string>) {
    if (isCategory(category)) {
      searchParams.set("category", category)
      if (subcategory && !isSubcategory(subcategory, category)) {
        searchParams.delete("subcategory")
        if (timeframe && !isTimeframe(timeframe, category)) {
          searchParams.delete("timeframe")
        }
      }
    } else {
      searchParams.delete("category")
    }
    navigate({
      pathname,
      search: `?${createSearchParams(searchParams)}`,
    })
  }

  function handleSubcategoryUpdate({
    target: {value: subcategory},
  }: SelectChangeEvent<string>) {
    if (subcategory !== "Any Subcategory") {
      searchParams.set("subcategory", subcategory)
    } else {
      searchParams.delete("subcategory")
    }
    navigate({
      pathname,
      search: `?${createSearchParams(searchParams)}`,
    })
  }

  function handleTimeframeUpdate({
    target: {value: timeframe},
  }: SelectChangeEvent<string>) {
    if (timeframe !== "Any Timeframe") {
      searchParams.set("timeframe", timeframe)
    } else {
      searchParams.delete("timeframe")
    }
    navigate({
      pathname,
      search: `?${createSearchParams(searchParams)}`,
    })
  }
}

function PaginatedVoteSection({
  clearCreatorId,
  isLast,
  loadNextPage,
  page,
  params,
  voteRoute,
}: {
  clearCreatorId: () => void
  isLast: boolean
  loadNextPage: () => void
  page: number
  params: {
    category?: string
    creatorId?: string
    subcategory?: string
    timeframe?: string
  }
  voteRoute: string
}) {
  const {t} = useTranslation()
  const [user] = useAuthState(auth)

  const {data: userVotes} = useVotes({
    creatorId: user?.uid,
  })
  const {data: allVotes, isLoading: isLoadingVotes} = useVotes({
    page,
    ...params,
  })
  const {canLoadMore, votes} = allVotes ?? {}
  const displayName = params.creatorId && votes?.at(0)?.creatorName

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      gap={6}
      px={4}
      textAlign="center"
    >
      {params.creatorId &&
      params.category &&
      params.subcategory &&
      params.timeframe ? (
        <>
          {isLoadingVotes ? (
            <CircularProgress />
          ) : votes?.length ? (
            <Box
              display="flex"
              flexDirection="column"
              gap={6}
              maxWidth="lg"
              textAlign="center"
            >
              <TextLink
                isVisiblyLink={false}
                to={{
                  pathname: "/",
                  search: `?${createSearchParams({
                    creatorId: params.creatorId,
                  })}`,
                }}
                tooltipText={"View user's votes"}
                variant="h5"
              >
                {t("by {{creatorName}}", {creatorName: displayName})}
              </TextLink>
              <Box
                columnGap={10}
                flexWrap="wrap"
                rowGap={40}
                display="flex"
                justifyContent="center"
              >
                <Box
                  alignItems="center"
                  display="flex"
                  flexDirection="column"
                  maxWidth="min(20rem, 100%)"
                >
                  <CandidateList candidates={votes[0].ballot} />
                </Box>
              </Box>
              {isLast && canLoadMore && (
                <Button
                  onClick={loadNextPage}
                  sx={{maxWidth: "fit-content", mx: "auto"}}
                  variant="outlined"
                >
                  {t("Load More")}...
                </Button>
              )}
            </Box>
          ) : page === 1 ? (
            <Typography variant="h5">
              {t("Selected user has not voted in category")}
            </Typography>
          ) : null}
          <Box display="flex" gap={4}>
            {userVotes &&
            userVotes.votes.some(
              ({category, subcategory, timeframe}) =>
                category === params.category &&
                subcategory === params.subcategory &&
                timeframe === params.timeframe,
            ) ? (
              <ButtonLink to={voteRoute} variant="outlined">
                {t("My Vote")}
              </ButtonLink>
            ) : (
              <ButtonLink to={voteRoute} variant="contained">
                {t("Vote Now")}
              </ButtonLink>
            )}
            {params.creatorId && (
              <Button onClick={clearCreatorId}>{t("More Votes")}</Button>
            )}
          </Box>
        </>
      ) : (
        <>
          {page === 1 && displayName && (
            <>
              <Typography variant="h4">
                {t("{{displayName}}'s Votes", {displayName})}
              </Typography>
              <Button onClick={clearCreatorId}>{t("More Votes")}</Button>
            </>
          )}
          {isLoadingVotes ? (
            <CircularProgress />
          ) : votes?.length ? (
            <Box
              display="flex"
              flexDirection="column"
              gap="4rem"
              maxWidth="lg"
              textAlign="center"
            >
              <Box
                display="flex"
                flexWrap="wrap"
                gap={6}
                justifyContent="center"
                mt={page === 1 ? 6 : 0}
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
                      border={1}
                      borderRadius={6}
                      display="flex"
                      flexDirection="column"
                      gap={4}
                      justifyContent="space-between"
                      key={category + subcategory + timeframe + creatorId}
                      p={4}
                      width={300}
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        gap={3}
                        width="clamp(fit-content, 100vw, 20rem)"
                      >
                        <TextLink
                          lineHeight={1.2}
                          to={{
                            pathname: "/",
                            search: `?${createSearchParams({
                              category,
                              subcategory,
                              timeframe,
                            })}`,
                          }}
                          variant="h6"
                        >
                          {!params.category &&
                            getCapitalizedCategory(category) +
                              (!params.subcategory || !params.timeframe
                                ? ": "
                                : "")}
                          {!params.subcategory && !params.timeframe
                            ? `${getSubcategoryText(
                                subcategory,
                              )} ${getTimeframeText(timeframe)}`
                            : !params.subcategory
                            ? getCapitalizedSubcategory(subcategory)
                            : !params.timeframe
                            ? getCapitalizedTimeframe(timeframe)
                            : null}
                        </TextLink>
                        {!params.creatorId && (
                          <TextLink
                            lineHeight={1.2}
                            to={{
                              pathname: "/",
                              search: `?${createSearchParams({
                                creatorId,
                              })}`,
                            }}
                            variant={
                              params.category &&
                              params.subcategory &&
                              params.timeframe
                                ? "h6"
                                : "body1"
                            }
                          >
                            {params.category &&
                            params.subcategory &&
                            params.timeframe
                              ? t("{{displayName}}'s Vote", {
                                  displayName: creatorName,
                                })
                              : t("by {{creatorName}}", {creatorName})}
                          </TextLink>
                        )}
                      </Box>
                      <CandidateList candidates={ballot} isAvatarGroup />
                      <Box display="flex" gap={4} my={2}>
                        {userVotes &&
                        userVotes.votes.some(
                          v =>
                            category === v.category &&
                            subcategory === v.subcategory &&
                            timeframe === v.timeframe,
                        ) ? (
                          <ButtonLink
                            to={`/${category}/${subcategory}/${timeframe}`}
                            variant="outlined"
                          >
                            {t("My Vote")}
                          </ButtonLink>
                        ) : (
                          <ButtonLink
                            to={`/${category}/${subcategory}/${timeframe}`}
                            variant="contained"
                          >
                            {t("Vote Now")}
                          </ButtonLink>
                        )}
                        <ButtonLink
                          to={{
                            pathname: "/",
                            search: `?${createSearchParams({
                              category,
                              creatorId,
                              subcategory,
                              timeframe,
                            })}`,
                          }}
                        >
                          {t("Expand")}
                        </ButtonLink>
                      </Box>
                    </Box>
                  ),
                )}
              </Box>
              {isLast && canLoadMore && (
                <Button
                  onClick={loadNextPage}
                  size="large"
                  sx={{maxWidth: "fit-content", mx: "auto"}}
                  variant="outlined"
                >
                  {t("Load More")}...
                </Button>
              )}
            </Box>
          ) : page === 1 ? (
            <>
              <Typography variant="h5">
                {t(
                  params.creatorId
                    ? "Selected user has not voted in category"
                    : "No votes in category",
                )}
              </Typography>
              <Box display="flex" gap={4}>
                {userVotes &&
                userVotes.votes.some(
                  ({category, subcategory, timeframe}) =>
                    category === params.category &&
                    subcategory === params.subcategory &&
                    timeframe === params.timeframe,
                ) ? (
                  <ButtonLink to={voteRoute} variant="outlined">
                    {t("My Vote")}
                  </ButtonLink>
                ) : (
                  <ButtonLink to={voteRoute} variant="contained">
                    {t("Vote Now")}
                  </ButtonLink>
                )}
                {params.creatorId && (
                  <Button onClick={clearCreatorId}>{t("More Votes")}</Button>
                )}
              </Box>
            </>
          ) : null}
        </>
      )}
    </Box>
  )
}
