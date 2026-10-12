package com.autopulse.vsm.util;

import com.autopulse.vsm.config.AuthInterceptor;
import com.autopulse.vsm.model.Role;
import com.autopulse.vsm.model.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class SecurityUtils {

    public static User getAuthenticatedUser(HttpServletRequest request) {
        User user = (User) request.getAttribute(AuthInterceptor.CURRENT_USER_ATTR);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
        return user;
    }

    public static User requireStaff(HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        if (user.getRole() != Role.STAFF) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Staff access required");
        }
        return user;
    }
}
