import {SimplePool} from 'nostr-tools/pool';
import {VerifiedEvent} from "nostr-tools/core";


const pool = new SimplePool()

export async function socketService(relays: string[], filter: {
                                        [key: string]: any
                                    } = {limit: 300},
                                    onEvent: Function,
                                    onEose: Function) {

    const h = pool.subscribeMany(
        relays,
        [
            filter,
        ],
        {
            onevent(event) {
                onEvent(event);
            },
            oneose() {
                onEose();
            }
        }
    )

}


export function send(relays: string[], newEvent: VerifiedEvent) {
    pool.publish(relays, newEvent);
    console.log(newEvent);
}

