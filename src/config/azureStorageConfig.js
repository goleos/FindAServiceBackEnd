
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

// Setup for Azure Blob Storage
const account = "findaservice";
const accountKey = process.env.AZURE_STORAGE_KEY;

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const containerName = process.env.AZURE_CONTAINER_NAME;

// Upload provider profile image to azure
const uploadProfileImage = async (file, id) => {

  const { name, data } = file

  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `provider/${id}/${name}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(data, data.length);

  return blockBlobClient.url
}

// Upload service images to azure
const uploadServiceImage = async (file, providerId, serviceId) => {

  const { name, data } = file

  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `provider/${providerId}/service/${serviceId}/${name}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(data, data.length);

  return blockBlobClient.url
}

module.exports = {
  uploadProfileImage,
  uploadServiceImage
}