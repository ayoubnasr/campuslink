const HomePageStyle = { 
  display: "flex",
  flexDirection: "row",
  width: "100vw",
  backgroundColor: "white",
  height: "100%",
  overflowY: "auto",
}

const sideOpenWidth = 260;
const sideClosedWidth = 65;

// 1) For the sidebar & layout
const sidebarStyle = (isOpen) => ({
    position: "fixed",
    top: 0,
    left: 0,
    width: isOpen? `${sideOpenWidth}px` : `${sideClosedWidth}px`,
    height: "100vh",
    background: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "30px",
    paddingBottom: "30px",
    boxShadow: "5px 0 10px rgba(0,0,0,0.2)",
    borderRadius: "0 0px 0px 0",
    zIndex: 1,
    transition: isOpen? "width 0.5s ease-in-out 0.5s" : "width 0.5s ease-in-out",
  });

  const searchbarStyle = (isOpen) => ({
    position: "fixed",
    top: 0,
    left: isOpen ? "0px" : "-500px",
    width: "440px", // Base width
    height: "100vh",
    background: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "30px",
    paddingBottom: "30px",
    paddingLeft: "68px",
    boxShadow: "5px 0 10px rgba(0,0,0,0.2)",
    zIndex: 0,
    transformOrigin: "left", // Scale from the left side
    transition: "left 0.8s ease-in-out", // Smooth scaling
  });
  
  

  const profileStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "30px",
    color: "black"
  };

  const profileImageStyle = (isOpen) => isOpen?{
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "4px solid white",
    marginBottom: "15px",
    objectFit: "cover",
    transition: "height 0.5s ease-in-out, width 0.5s ease-in-out 0.5s",
  }:
  {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid white",
    marginBottom: "15px",
    objectFit: "cover",
    transition: "width 0.5s ease-in-out, height 0.5s ease-in-out 0.5s",
  };
  
  const buttonContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    alignItems: "center"
  };
  const buttonStyle = {
    background: "rgba(15, 15, 15, 0.1)",
    border: "none",
    color: "black",
    fontSize: "22px",
    fontWeight: "400",
    cursor: "pointer",
    padding: "15px",
    width: "90%",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderRadius: "30px",
    transition: "0.3s ease-in-out"
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: "rgba(15, 15, 15, 0.1)",
    color: "#1f2a38",
    fontWeight: "bold",
    boxShadow: "0px 4px 6px rgba(255,255,255,0.2)"
  };

  const logoutButtonStyle = {
    ...buttonStyle,
    background: "rgba(255,0,0,0.9)",
    color: "white",
    marginTop: "auto"
  };

  const content_X_Offset = 300;

// 2) Main content
  const contentStyle = {
    width: '100%',
    marginLeft: `${sideOpenWidth + content_X_Offset}px`,
    marginRight: `${content_X_Offset}px`,
    fontSize: "24px",
    color: "white",
    minHeight: "100vh",
  };
  const universityBannerStyle = {
    width: "100%",
    height: "250px",
    backgroundImage: "url('https://via.placeholder.com/1200x300')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "36px",
    fontWeight: "bold",
    textShadow: "2px 2px 10px rgba(0,0,0,0.6)",
    marginBottom: "20px"
  };

// 3) Profile card
  const profileCardWrapperStyle = {
    display: "flex",
    justifyContent: "center",
    marginTop: "10px"
  };
  const profileCardStyle = {
    position: "relative",
    backgroundColor: "#2c3e50",
    borderRadius: "30px",
    padding: "60px 30px 30px",
    maxWidth: "450px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
  };
  const profileCardImageContainer = {
    position: "absolute",
    top: "-75px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "4px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#444"
  };
  const editIconStyle = {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
    zIndex: 9999
  };
  const profileCardImageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  };
  const profileCardNameStyle = {
    marginTop: "85px",
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase"
  };
  const profileCardRoleStyle = {
    fontSize: "1.1rem",
    color: "#ccc",
    marginBottom: "15px"
  };
  const profileCardDescriptionStyle = {
    fontSize: "1rem",
    color: "#eee",
    marginBottom: "20px",
    lineHeight: "1.4"
  };
  const profileCardButtonStyle = {
    backgroundColor: "#fff",
    color: "#1f2a38",
    padding: "10px 20px",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    boxShadow: "0 3px 6px rgba(0,0,0,0.2)"
  };

// 4) Event creation form
    const formInputStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "15px"
    };
    const formSelectStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    backgroundColor: "#fff",
    color: "#000"
    };
    const formButtonStyle = {
    backgroundColor: "#1f2a38",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginRight: "10px"
    };
    const createFormContainerStyle = {
      backgroundColor: "white",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", 
      borderRadius: "10px",
      color: "black",
      padding: "20px",
    };

  // 5) Events listing (no pink bubble)
  const timelineContainerStyle = {
    backgroundColor: "white",
    flex: 1, // Expands to available space
    height: "100vh",
  };

const timelineContainerScrollbarStyle = {
  WebkitScrollbar: {
    width: "6px", // Thin scrollbar
  },
  WebkitScrollbarThumb: {
    backgroundColor: "#aaa", // Visible scrollbar handle
    borderRadius: "10px", // Rounded edges
  },
  WebkitScrollbarTrack: {
    background: "transparent", // Fully hidden track
  },
};


  const postCardStyle = {
    color: "black",
    backgroundColor: "rgba(255, 255, 255, 1)", // Translucent card
    borderRadius: "2px",
    paddingBottom: "10px",
    marginBottom: "10px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", // Softer shadow
  };

  const postHeaderStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "20px",
    padding: "10px",
    marginBottom: "10px",
    borderBottom: "1px solid white"
  }
  
  const postButtonStyle = {
    marginLeft: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgb(255, 255, 255)',
    color: 'black',
    textDecoration: 'none',
    border: "1px solid black",
    borderRadius: '4px',
    fontSize: '14px',
    display: 'inline-block'
  }

  const eventCardStyle = {
    color: "black",
    backgroundColor: "rgba(0, 0, 0, 0.04)", // Translucent card
    borderRadius: "2px",
    padding: "10px",
    margin: "10px",
};

  const eventHeaderStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "20px",
    padding: "10px",
    marginBottom: "10px",
    borderBottom: "1px solid white"
  }

  const postClubIconStyle = {
    width: "40px",
    height: "40px",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "50%"
  }

  const postClubTitleStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: "5px"
    };

    const postDetailsContainerStyle = {

      width: "100%",
      padding: "10px"

    };

    const postTitleStyle = {
      fontWeight: "bold",
      fontSize: "1.2rem",
      marginBottom: "5px"
    };

    const postDetailsStyle = {
      fontSize: "1.1rem",
      marginBottom: "0px",
      opacity: 0.9
    };
    const eventInfoRow = {
    display: "flex",
    alignItems: "center",
    marginBottom: "5px",
    fontSize: "0.95rem"
    };
    const eventIconStyle = { marginRight: "6px" };

    const eventRegistrationButton = {
      backgroundColor: "#44D365",
      border: "none",
      borderRadius: "5px",
      width: "20%",
      height: "40px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      fontWeight: "bold",
      color: "black",
    }

    const eventFooter = {

      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",

    }

    const actionButtonStyle = {
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
      color: "#555",
  };

const actionBarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    padding: "5px 5px",
    borderRadius: "5px",
    marginTop: "-5px",
    marginBottom: "10px",

};

const actionIconStyle = {
    fontSize: "24px",
    color: "white", // Make all icons white
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out, color 0.2s ease-in-out",
};

// Optional: Hover effect for interactivity
const hoverEffect = {
    ":hover": {
        transform: "scale(1.1)",
        color: "#f39c12", // Changes color slightly on hover
    },
};

  

  export {HomePageStyle, sidebarStyle, searchbarStyle, profileStyle, profileImageStyle, buttonContainerStyle,
     buttonStyle, activeButtonStyle, logoutButtonStyle, contentStyle, universityBannerStyle,
     profileCardWrapperStyle, profileCardStyle, profileCardImageContainer, editIconStyle, profileCardImageStyle,
     profileCardNameStyle, profileCardRoleStyle, profileCardDescriptionStyle, profileCardButtonStyle,
     formInputStyle, formSelectStyle, formButtonStyle, createFormContainerStyle, timelineContainerStyle, timelineContainerScrollbarStyle,
     eventCardStyle, eventHeaderStyle, postCardStyle, postHeaderStyle, postButtonStyle, postClubIconStyle,postClubTitleStyle, postTitleStyle, 
     postDetailsContainerStyle, postDetailsStyle, eventInfoRow, eventIconStyle, eventFooter, eventRegistrationButton, actionBarStyle, actionIconStyle, hoverEffect, actionButtonStyle};