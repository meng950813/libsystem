
function sleepSync(ms) {
	return new Promise(done => {
	    setTimeout(done, ms)
	})
}


(async function() {
	console.log(new Date())
	await sleepSync(1000)
	console.log(new Date())
})()


// test ssh