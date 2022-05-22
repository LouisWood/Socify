const cookieParser = require('cookie-parser')
const axios = require('axios').default
require('dotenv').config()

const getAccessToken = async (code) => {
    const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
            code: code,
            redirect_uri: encodeURI(process.env.REDIRECT_URI),
            grant_type: 'authorization_code'
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET, 'utf-8').toString('base64')
        }
    })
    .then(resToken => {
        return {
            res: resToken.data
        }
    })
    .catch(err => {
        return {
            error: err
        }
    })

    return response
}

const checkIfTokenIsExpired = async (req, res) => {
    const access_token = req.signedCookies ? req.signedCookies.access_token : null
    const refresh_token = req.signedCookies ? req.signedCookies.refresh_token : null
    const expireTime = req.signedCookies ? req.signedCookies.expireTime : null

    if (access_token && refresh_token && expireTime) {
        if ((new Date()).getTime() >= Date.parse(expireTime))
            return await refreshToken(refresh_token, res)
        else
            return false
    } else {
        deleteAndRedirect(res)
        return true
    }
}

const refreshToken = async (refresh_token, res) => {
    const response = await axios({
        method: 'post',
        url : 'https://accounts.spotify.com/api/token',
        params: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET, 'utf-8').toString('base64')
        }
    })
    .then(resToken => {
        const currentTime = new Date()
        const expireTime = new Date(currentTime.getTime() + 55 * 60 * 1000)

        res.clearCookie('access_token')
        res.clearCookie('expireTime')

        res.cookie('access_token', resToken.data.access_token, {signed: true})
        res.cookie('expireTime', expireTime.toString(), {signed: true})
        
        return false
    })
    .catch(error => {
        if ('response' in error && 'status' in error.response && error.response.status === 401)
            deleteAndRedirect(res)
        else
            res.redirect('http://localhost:3000')
        return true
    })

    return response
}

const deleteAndRedirect = (res) => {
    res.clearCookie('userID')
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.clearCookie('expireTime')

    res.redirect('http://localhost:3000/')
}

module.exports = { getAccessToken, checkIfTokenIsExpired, refreshToken, deleteAndRedirect }