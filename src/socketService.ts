import {SimplePool} from 'nostr-tools/pool';
export async function socketService(relays: string[], callback: Function, filter: {[key: string]: any} = {limit: 300}) {
    const pool = new SimplePool()

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
