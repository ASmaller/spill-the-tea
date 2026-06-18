import { TeaStat } from "@/lib/types";
import { TeaThumb, TriedStatus } from "./TeaThumb";
import { TeaCard } from "./TeaCard";



type Props = {
    tea: TeaStat;
    urlPrefix: string;
    highlightTag?: TeaTag;
    onClick?: (id: string) => void;
};

export function TeaOfTheDay({ tea, urlPrefix, highlightTag, onClick }: Props) {


    return (
        <div>
            <div className="text-ink text-feature font-serif">
                {"Tea of the Day!"}
            </div>
            <TeaCard tea={tea} urlPrefix={urlPrefix} highlightTag={highlightTag} onClick={onClick}></TeaCard>
        </div>
    );

}