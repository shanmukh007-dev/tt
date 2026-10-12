package com.autopulse.vsm.controller;

import com.autopulse.vsm.dto.PortalSummaryResponse;
import com.autopulse.vsm.model.User;
import com.autopulse.vsm.service.PortalService;
import com.autopulse.vsm.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portal")
public class PortalController {

    private final PortalService portalService;

    public PortalController(PortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/summary")
    public PortalSummaryResponse getSummary(HttpServletRequest request) {
        User user = SecurityUtils.getAuthenticatedUser(request);
        return portalService.getPortalSummary(user);
    }
}
