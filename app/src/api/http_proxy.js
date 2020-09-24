import firebaseapp from "../../src/scenes/base";

const processResponse = async (response, isJson) => {
  if (response && typeof response.ok !== "undefined" && response.ok) {
    const data = isJson ? await response.json() : response.body;
    if (response.status === 201) {
      return { data: response, error: null };
    } else if (data.error) {
      return { data: null, error: data };
    } else {
      return { data: data, error: null };
    }
  } else {
    if (response.status === 401) {
      console.log("UNAUTHENTICATED, TOKEN EXPIRED!!");
      console.log("--------------------");
      if (process.env.REACT_APP_FRICTIONLESS === "true") {
        console.log("RELOAD!!");
        window.reload();
      } else {
        console.log("SIGNOUT(expired token) to re-login...");
        firebaseapp.auth().signOut();
        window.reload();
      }
    }
    return { data: null, error: response };
  }
};

const setSourceHeader = (userInfo) => {
  let sourceHeader = "";
  if (
    window.location.host.includes("policy") ||
    (userInfo &&
      typeof userInfo.role !== "undefined" &&
      userInfo.role.includes("policy"))
  ) {
    sourceHeader = "policyassist";
  } else if (
    window.location.host.includes("claim") ||
    (userInfo &&
      typeof userInfo.role !== "undefined" &&
      userInfo.role.includes("claim"))
  ) {
    sourceHeader = "claimassist";
  } else {
    sourceHeader = process.env.REACT_APP_DEFAULT_SOURCE;
  }
  return sourceHeader;
};

const setRoleHeader = (userInfo) => {
  let roleHeader = "";
  if (
    userInfo &&
    typeof userInfo.role !== "undefined" &&
    userInfo.role.includes("submitter") === false
  ) {
    roleHeader = "admin";
  } else {
    roleHeader = "submitter";
  }
  return roleHeader;
};

export const get = async (url, userInfo = null, headers = {}) => {
  headers["Accept"] = "application/json";
  headers["x-galaxyai-source"] = setSourceHeader(userInfo);
  headers["x-galaxyai-role"] = setRoleHeader(userInfo);
  let token = userInfo.token;
  if (firebaseapp.auth().currentUser)
    token = await firebaseapp.auth().currentUser.getIdToken();

  //console.log("bearer tkn :: " + token);
  if (process.env.REACT_APP_API_AUTH === "true") {
    headers["Authorization"] = "Bearer " + token;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      mode: "cors",
    });

    return await processResponse(response, true);
  } catch (error) {
    return { data: null, error: error };
  }
};

export const sendData = async (
  method,
  url,
  data,
  userInfo = null,
  headers = {}
) => {
  let token;
  if (userInfo) token = userInfo.token;
  if (firebaseapp.auth().currentUser)
    token = await firebaseapp.auth().currentUser.getIdToken();

  if (process.env.REACT_APP_API_AUTH === "true") {
    headers["Authorization"] = "Bearer " + token;
  }

  let isJson = true;
  let body = data;
  const headerString = JSON.stringify(headers);
  if (headerString.includes("image")) {
    body = data;
    isJson = false;
  } else {
    headers["x-galaxyai-source"] = setSourceHeader(userInfo);
    headers["x-galaxyai-role"] = setRoleHeader(userInfo);
    body = JSON.stringify(data);
  }
  // console.log(isJson)
  // if(isJson)
  //   console.log(body)

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      mode: "cors",
      body: body,
    });

    return await processResponse(response, isJson);
  } catch (error) {
    return { data: null, error: error };
  }
};

export const post = async (url, data, headers) => {
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
    .then(processResponse)
    .then(async (resp) => {
      const json = await resp.json();
      return {
        data: json,
        error: null,
      };
    })
    .catch((error) => {
      console.log("POST error:" + error);
      return {
        data: null,
        error: error,
      };
    });

  return response;
};
export const actionClaimLevel = async (
  url,
  data,
  userInfo,
  headers = { "Content-Type": "application/json" }
) => {
  let token;
  if (userInfo) token = userInfo.token;
  if (firebaseapp.auth().currentUser)
    token = await firebaseapp.auth().currentUser.getIdToken();

  if (process.env.REACT_APP_API_AUTH === "true") {
    headers["Authorization"] = "Bearer " + token;
    headers["x-galaxyai-source"] = setSourceHeader(userInfo);
    headers["x-galaxyai-role"] = setRoleHeader(userInfo);
  }
  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(data),
  })
    .then(processResponse)
    .then(async (resp) => {
      // const json = await resp.json();
      console.log("---claim level update ---", resp);
      return {
        data: resp.data,
        error: resp.error,
      };
    })
    .catch((error) => {
      console.log("POST error:" + error);
      return {
        data: null,
        error: error,
      };
    });

  return response;
};
export const put = async (url, data, headers) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    mode: "cors",
    body: data,
  })
    .then(processResponse)
    .then(async (resp) => {
      const json = await resp.json();
      return {
        data: json,
        error: null,
      };
    })
    .catch((error) => {
      console.log(error);
      return {
        data: null,
        error: error,
      };
    });

  return response;
};

const support_upload_image = async (url, item) => {
  let output;
  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Length": item.file.size,
    },
    body: item.file,
  })
    .then((response) => {
      console.log(response);
      console.log("_______Simple Response______");
      for (var pair of response.headers.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      console.log(
        "Uploaded-content  :" +
          response.headers.get("x-goog-stored-content-length")
      );
      if (
        parseInt(response.headers.get("x-goog-stored-content-length")) ===
        item.file.size
      ) {
        output = {
          ok: true,
          data: "Upload Successfully",
          error: null,
        };
      }
    })
    .catch((error) => {
      console.error("error while making post request");
      console.error(error);
      output = {
        ok: false,
        data: "need to re upload",
        error: error,
      };
    });
  console.log(output);
  return output;
};

const re_upload = async (url, item, headers) => {
  let output;
  await fetch(url, {
    method: "PUT",
    headers: headers,
    body: item.file,
  })
    .then((res) => {
      console.log("______Re Uploaded");
      res.status === 200 ? console.log("Successful") : console.log("failure");
      output = {
        ok: true,
        data: "Uploaded Successful",
        error: null,
      };
    })
    .catch((err) => {
      console.error("error while making post request");
      console.error(err);
      output = {
        ok: false,
        data: null,
        error: err,
      };
    });

  return output;
};

export const upload_image = async (url, item) => {
  console.log("_____hitted the upload image____");
  console.log(url, item);
  let output;
  if (item.re_upload) {
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Length": 0,
        "Content-Range": "bytes */*",
      },
    }).then(async (resp) => {
      console.log("in checking call");
      console.log(
        "Uploaded-content  :" + resp.headers.get("x-goog-stored-content-length")
      );
      for (var pair of resp.headers.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      if (resp.status === 200) {
        output = {
          ok: true,
          data: "Upload Successful",
          error: null,
        };
      } else if (resp.status === 308) {
        if (resp.headers.get("range")) {
          let range = resp.headers.get("range").split("-")[1];
          let range_from = parseInt(range) + 1;
          let range_to = item.file.size - 1;
          let headers = {
            "Content-Length": item.file.size - range_from,
            "Content-Range": `bytes ${range_from}-${range_to}/${item.file.size}`,
            "Content-Type": "image/" + item.type,
          };
          output = await re_upload(url, item, headers);
        } else {
          output = await support_upload_image(url, item);
        }
      }
    });
    console.log(output);
    return output;
  } else {
    output = await support_upload_image(url, item);
    console.log(output);
    return output;
  }
};
