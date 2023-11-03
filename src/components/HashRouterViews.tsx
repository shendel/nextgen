import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import React from "react"

export default function HashRouterViews(props) {
  const {
    on404,
    views,
  } = props
  const router = useRouter()
  const [hash, setHash] = useState(router.asPath.split('#')[1] || '')

  const gotoPage = (url) => {
    window.location.hash = url
  }

  const updateHash = (str) => {
    if (!str) {
      setHash('/')
    } else {
      setHash(str.split('#')[1])
    }
  }

  useEffect(() => {
    const onWindowHashChange = () => updateHash(window.location.hash)
    const onNextJSHashChange = (url) => updateHash(url)

    router.events.on('hashChangeStart', onNextJSHashChange)
    window.addEventListener('hashchange', onWindowHashChange)
    window.addEventListener('load', onWindowHashChange)
    return () => {
      router.events.off('hashChangeStart', onNextJSHashChange)
      window.removeEventListener('load', onWindowHashChange)
      window.removeEventListener('hashchange', onWindowHashChange)
    }
  }, [router.asPath, router.events])

  const detectView = (hash) => {
    if (!hash) hash = `/`
    let activeView = false
    Object.keys(views).forEach((path) => {
      const pathParts = []
      const pathParams = {}
      let pathParamsCount = 0
      path
        .split('/')
        .filter((part) => { return part != '' })
        .forEach((part, index) => {
          if (part.substr(0,1) == ":") {
            pathParams[index] = part
            pathParamsCount++
          } else {
            pathParts.push(part)
          }
        })
      const hashParts = []
      const hashParams = {}
      let hashParamsCount = 0
      hash
        .split('/')
        .filter((part) => { return part != '' })
        .forEach((part, index) => {
          if (pathParams[index] !== undefined) {
            hashParams[pathParams[index].substr(1)] = part
            hashParamsCount++
          } else {
            hashParts.push(part)
          }
        })

      if ((hashParamsCount == pathParamsCount)
        && hashParts.join('/').toLowerCase() == pathParts.join('/').toLowerCase()
      ) {
        activeView = {
          params: hashParams,
          path,
        }
      }
    })
    return activeView
  }
  
  const [ activeView, setActiveView ] = useState(detectView(hash))
  
  useEffect(() => {
    setActiveView(detectView(hash))
  }, [ hash ])

  if (activeView) {
    return React.createElement(views[activeView.path], {...props, gotoPage, params: activeView.params})
  } else {
    if (on404) {
      return React.createElement(on404, {...props, gotoPage })
    } else {
      return null
    }
  }
}