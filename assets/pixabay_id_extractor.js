// Go to https://pixabay.com/accounts/collections/25813420/
// Scrolle bien tout en bas pour charger toute les images
// Colle ça dans la console, récupère les ids

console.log(
	Object.values(document.querySelectorAll('div > a[class] > img'))
		.map((image) => image.src)
		.map((src) => src.slice(src.lastIndexOf('/') + 1, src.indexOf('-')).split('_')[0])
		.join(', ')
)
