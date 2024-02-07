import { isError } from "@tanstack/react-query"
import InfiniteScroll  from "react-infinite-scroll-component"
import { ProfileImage } from "./ProfileImage";
import Link from "next/link";
type Tweet = {
    id: string,
    content: string,
    createdAt: Date,
    likeCount: number,
    likeByMe: boolean,
    user: { id: string; image: string | null; name: string | null}
}

type InfiniteTweetListProps = {
    isLoading: boolean,
    isError: boolean,
    hasMore: boolean,
    fetchNewTweets: () => Promise<unknown>,
    tweets?: Tweet[]
}
export function InfiniteTweetList( { tweets, isError, isLoading, fetchNewTweets, hasMore }: InfiniteTweetListProps ) {
    if (isLoading) return <h1> Loading... </h1>;
    if (isError) return <h1> Error... </h1>

    if (tweets == null || tweets.length === 0) {
        return <h2 className="my-4 text-center text-2x1 text-gray-50">No Tweets</h2>
    }

    return <ul>
        <InfiniteScroll dataLength={tweets.length} 
                        next={fetchNewTweets}
                        hasMore={hasMore}
                        loader={"loading..."} >
            { tweets.map(tweet => {
                return <TweetCard key={tweet.id} {...tweet}/>;
            })}
        </InfiniteScroll>
    </ul>
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "short"});

function TweetCard({id, user, content, createdAt, likeCount, likeByMe}: Tweet){
    return <li className="flex gap-4 border-b px-4 py-4">
            <Link href={`/profiles/${user.id}`}>
                <ProfileImage src={user.image}/>
            </Link>
            <div className="flex flex-grow flex-col">
                {/* User Information */}
                <div className="flex gap-1">
                    <Link 
                        href={`/profiles/${user.id}`}
                        className="font-bold hover:underline focus-visible:underline">
                            {user.name}
                        </Link>
                        <span className="text-gray-500">-</span>
                        <span className="text-gray-500">{dateTimeFormatter.format()}</span>
                </div>
                {/* content */}
                <p className="whitespace-pre-wrap">{content}</p>
                <HeartButton />
            </div>
        </li>
}

function HeartButton() {
    return <h1>Heart</h1>
}