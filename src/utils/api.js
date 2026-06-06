import axios from 'axios'

const getAuthHeaders = () => {
    const authText =
        localStorage.getItem('aiVoiceAuth')
        || sessionStorage.getItem('aiVoiceAuth')

    if (!authText) {
        return {}
    }

    try {
        const auth = JSON.parse(authText)

        return {
            'X-Login-Email': auth.email || '',
            'X-Auth-Token': auth.token || ''
        }
    } catch (error) {
        return {}
    }
}

/**
 * GET 공통 통신
 */
export const getApi = async (
    url,
    params = {}
) => {
    try {
        const response = await axios.get(
            url,
            {
                params: params,
                headers: getAuthHeaders()
            }
        )

        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            data: error?.response?.data || null,
            status: error?.response?.status || 0
        }
    }
}

/**
 * POST 요청
 */
export const postApi = async (url, data = {}) => {
    try {
      const res = await axios.post(
        url,
        data,
        {
          headers: getAuthHeaders()
        }
      )
      return res.data
    } catch (error) {
      console.error("[POST API ERROR]", error)
      throw error
    }
}

/**
 * 첨부파일이 있을때 POST 요청
 */
export const postMultiApi = async (
    url,
    params,
    file = null
) => {

    try {
        const formData = new FormData()

        // DTO JSON
        formData.append(
            'data',
            new Blob(
                [JSON.stringify(params)],
                { type: 'application/json' }
            )
        )

        // 파일 존재 시만 추가
        if (file) {
            formData.append('file', file)
        }

        await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...getAuthHeaders()
            }
        })

        return true

    } catch (error) {
        console.error(error)
        return false
    }
}

/**
 * Excel Download
 */
export const excelDownloadApi = async (
    url,
    params = {},
    fileName = "download.xlsx",
    options = {}
) => {
    try {
        const response = await axios.post(
            url,
            params,
            {
                responseType: "blob",
                headers: getAuthHeaders(),
                ...options
            }
        )

        // Blob 생성
        const blob = new Blob(
            [response.data],
            {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        )

        // URL 생성
        const downloadUrl = window.URL.createObjectURL(blob)

        // a 태그 생성
        const link = document.createElement("a")
        link.href = downloadUrl

        link.setAttribute(
            "download",
            fileName
        )
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

/**
 * DELETE 요청
 */
export const deleteApi = async (
    url,
    params = {}
) => {
    try {
        const response = await axios.delete(
            url,
            {
                params: params,
                headers: getAuthHeaders()
            }
        )

        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        console.error("[DELETE API ERROR]", error)
        return {
            success: false,
            data: null
        }
    }
}

/**
 * GET Blob 공통 통신
 */
export const getBlobApi = async (
    url,
    params = {}
) => {
    try {
        const response = await axios.get(
            url,
            {
                params: params,
                responseType: 'blob',
                headers: getAuthHeaders()
            }
        )

        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            data: error?.response?.data || null,
            status: error?.response?.status || 0
        }
    }
}

/**
 * PUT 요청
 */
export const putApi = async (
    url,
    data = {}
) => {
    try {
        const response = await axios.put(
            url,
            data,
            {
                headers: getAuthHeaders()
            }
        )

        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        console.error("[PUT API ERROR]", error)
        return {
            success: false,
            data: null
        }
    }
}
