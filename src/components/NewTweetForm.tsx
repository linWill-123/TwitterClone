import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
import { FormEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { api } from "~/utils/api";

function updateTextAreaSize(textArea ?: HTMLTextAreaElement) {
    if (textArea == null) return;
    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
}


export function NewTweetForm() {
    const session =  useSession();
    if (session.status !== "authenticated") return;
    return <Form/>
}

export function Form() {
    const [inputValue, setInputValue] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
        updateTextAreaSize(textArea);
        textAreaRef.current = textArea;
    }, []);
    const trpcUtils = api.useUtils();

    useLayoutEffect(() => {
        updateTextAreaSize(textAreaRef.current);
    }, [inputValue]);

    const session =  useSession();

    if (session.status !== "authenticated") return null;

    const createTweet = api.tweet.create.useMutation(
        {
            onSuccess: (newTweet) => {
                setInputValue("");
                
                trpcUtils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
                    if (oldData?.pages[0] == null) return;

                    const newCachedTweet =  {
                        ...newTweet,
                        likeCount: 0,
                        likeByMe: false,
                        user: {
                            id: session.data.user.id,
                            name: session.data.user.name ?? null,
                            image: session.data.user.image ?? null,
                        }
                    };

                    return {
                        ...oldData,
                        pages: [
                            {
                                ...oldData.pages[0],
                                tweets: [newCachedTweet, ...oldData.pages[0].tweets],
                            },
                            ...oldData.pages.slice(1),
                        ]
                    }
                })
                
            },
        }
    );

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        
        createTweet.mutate( { content: inputValue } );
    }

    return <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
                <div className="flex gap-4"> 
                    <ProfileImage src={session.data.user.image} />
                    <textarea 
                            ref={inputRef}
                            style={{height: 0}}
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" 
                            placeholder="What's happening "
                            />
                </div>
                <Button className="self-end">Tweet</Button>
            </form>;
}