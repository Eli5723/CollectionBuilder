// https://stackoverflow.com/questions/19687407/press-any-key-to-continue-in-nodejs

const keypress = async () => {
    process.stdin.setRawMode(true);
    return new Promise((resolve) =>
        process.stdin.once("data", () => {
            process.stdin.setRawMode(false);
            resolve();
        })
    );
};

module.exports = { keypress };
