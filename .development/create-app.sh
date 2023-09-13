
LANGUAGES=en,uk
CONTACT_URL=https://example.com


nx g @softkit/resource-plugin:app  \
  --languages=$LANGUAGES \
  --contactUrl=$CONTACT_URL \
  --directory=$DIRECTORY \
  --tags=$TAGS \
  --dryRun=$DRY_RUN
