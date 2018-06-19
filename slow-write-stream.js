const {Writable, Readable} = require("stream")
const crypto = require("crypto")

class SlowConsoleLogStream extends Writable {
    _write(chunk, encoding, cb) {
        setTimeout(
            () => {
                console.log("generated count:", JSON.parse(chunk.toString()).generatedCount)
                cb()
            },
            500
        )
    }
}

class RandomStream extends Readable {
    _pushNewBuffer() {
        this.generatedCount = (this.generatedCount || 0) + 1
        const generatedCount = this.generatedCount
        const buffer = Buffer.alloc(1024 * 1024)
        crypto.randomFill(buffer, (err, filledBuffer) => {
            if (err) {
                throw err
            }
            if (this.push(JSON.stringify({generatedCount: generatedCount, buffer: buffer}))) {
                process.nextTick(() => this._pushNewBuffer())
            } else {
                console.log("random stream paused")
            }
        })
    }
    _read(size) {
        console.log("random stream read")
        this._pushNewBuffer()
    }
}

const random$ = new RandomStream()
const console$ = new SlowConsoleLogStream()

random$.pipe(console$)
