    const profileContainerStyle = {
        display: "flex",
        flexDirection: "column",
        maxWidth: "800px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
    };

    const profileHeaderStyle = {
        color: "black",
        display: "flex",
        alignItems: "center",
        padding: "20px",
        borderBottom: "1px solid #ddd",
    };

    const profilePictureStyle = {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        marginRight: "20px",
    };

    const topRowStyle = {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    };

    const followButtonStyle = (trigger) => ({
        width: "150px",
        background: (!trigger)? "#0095f6" : "rgba(0,0,0,0)",
        color: (!trigger)? "white" : "black",
        border: (!trigger)? "none" : "1px solid black",
        padding: "6px 12px",
        borderRadius: "4px",
        cursor: "pointer",
    });

    const settingsIconStyle = {
        fontSize: "20px",
        cursor: "pointer",
    };

    const statsStyle = {
        display: "flex",
        gap: "15px",
        margin: "10px 0",
    };

    const bioStyle = {
        fontSize: "14px",
        color: "#555",
    };

    const tabsStyle = {
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
        borderTop: "1px solid #ddd",
        paddingTop: "10px",
    };

    const tabButtonStyle = (isActive) => ({
        flex: 1,
        background: "none",
        border: "none",
        padding: "10px",
        fontSize: "14px",
        cursor: "pointer",
        color: isActive ? "black" : "gray",
        fontWeight: isActive ? "bold" : "normal",
        borderBottom: isActive ? "2px solid black" : "none",
    });

    const postsGridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "5px",
        marginTop: "15px",
    };

    const postImageStyle = {
        width: "100%",
        aspectRatio: "1",
        objectFit: "cover",
        cursor: "pointer",
    };

    const eventCardStyle = {
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        margin: "16px",
        padding: "16px",
        color: "#333",
        maxWidth: "300px",
        fontFamily: "sans-serif",
      };
      
      const eventImageStyle = {
        height: "180px",
        backgroundColor: "#eee",
        borderRadius: "8px",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        color: "#888",
      };
      
      const titleStyle = {
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "8px",
      };
      
      const dateStyle = {
        fontSize: "14px",
        color: "#555",
      };


    export {
        profileContainerStyle,
        profileHeaderStyle,
        profilePictureStyle,
        topRowStyle,
        followButtonStyle,
        settingsIconStyle,
        statsStyle,
        bioStyle,
        tabsStyle,
        tabButtonStyle,
        postsGridStyle,
        postImageStyle,
        eventCardStyle,
        eventImageStyle,
        titleStyle,
        dateStyle
    };