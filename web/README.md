## Quickstart

```
# Run setup script
./scripts/bootstrap.sh

# enable localhost SSL
mkcert -install
(ipaddr=$(ipconfig getifaddr en1) && \
  cd ./priv/cert/ && \
  mkcert \
  --cert-file localhost-cert.pem \
  --key-file localhost-key.pem \
  trawler.wip localhost 127.0.0.1 ::1 $ipaddr.xip.io \
  )

### on iOS Simulator

open "$(mkcert -CAROOT)"
# ...drag/drop *.cer file onto sim, Settings > General > Profiles
open web/priv/cert
# ...drag/drop localhost-cert.pem onto sim, Settings > General > Profiles


# copy/edit local env vars
cp .env.dev.example .env.dev

heroku local:run -e .env.dev mix ecto.create
heroku local:run -e .env.dev mix ecto.migrate
heroku local -e .env.dev

# optional: `https://trawler.wip` using `puma-dev`
sudo puma-dev -uninstall && puma-dev -setup
echo 5000 > .port
wd=$(pwd) && (cd ~/.puma-dev/ && ln -s $wd/.port trawler)
puma-dev -install -debug -d test:wip:localhost -launchd
open https://trawler.wip
```

## Deployment

```
heroku git:remote -r prod -a yet-prod
(cd .. && git push prod --force `git subtree split --prefix web HEAD`:refs/heads/master)
```
