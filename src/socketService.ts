import {SimplePool} from 'nostr-tools/pool';
import {VerifiedEvent} from "nostr-tools/core";
import {Filter} from "nostr-tools/filter";


const pool = new SimplePool()

export async function socketService(relays: string[], filter: {
                                        [key: string]: any
                                    } = {limit: 300},
                                    onEvent: Function,
                                    onEose: Function | undefined) {

    pool.subscribeMany(
        relays,
        [
            filter,
        ],
        {
            onevent(event) {
                onEvent(event);
            },
            oneose() {
                onEose && onEose();
            }
        }
    )

}


export function send(relays: string[], newEvent: VerifiedEvent) {
    pool.publish(relays, newEvent);
    console.log(newEvent);
}

export function subscribe(relays: string[], filter: Filter, onEvent: Function, onEose: Function) {
    return pool.subscribeMany(
        relays,
        [
            filter,
        ],         {
            onevent(event) {
                onEvent(event);
            },
            oneose() {
                //closer.close();
                onEose();
            }
        }
    )
}