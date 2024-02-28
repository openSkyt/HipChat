import {SimplePool} from 'nostr-tools/pool';
import {VerifiedEvent} from "nostr-tools/core";


const pool = new SimplePool()
export async function socketService(relays: string[], callback: Function, filter: {[key: string]: any} = {limit: 300}) {

    const h = pool.subscribeMany(
        relays,
        [
            filter,
        ],
        {
            onevent(event) {
                callback(event)
            },
            oneose() {
            }
        }

    )

}


export function send(relays:string[], newEvent: VerifiedEvent) {
    pool.publish(relays, newEvent);
    console.log(newEvent);
}

