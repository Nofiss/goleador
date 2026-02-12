using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Teams.Commands.UploadBranding;

public record UploadTeamBrandingCommand(
    Guid TeamId,
    FileDto? Logo,
    FileDto? Sponsor
) : IRequest<BrandingUrlsDto>;

public record FileDto(Stream Content, string FileName, long Length);

public record BrandingUrlsDto(string? LogoUrl, string? SponsorUrl);

public class UploadTeamBrandingCommandHandler(
    IApplicationDbContext context,
    IFileStorageService fileStorageService
) : IRequestHandler<UploadTeamBrandingCommand, BrandingUrlsDto>
{
    public async Task<BrandingUrlsDto> Handle(UploadTeamBrandingCommand request, CancellationToken cancellationToken)
    {
        var team = await context.TournamentTeams
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
        {
            throw new NotFoundException(nameof(TournamentTeam), request.TeamId);
        }

        string? newLogoUrl = team.LogoUrl;
        string? newSponsorUrl = team.SponsorUrl;

        if (request.Logo != null)
        {
            ValidateFile(request.Logo, "Logo");
            if (!string.IsNullOrEmpty(team.LogoUrl))
            {
                await fileStorageService.DeleteFileAsync(team.LogoUrl);
            }
            newLogoUrl = await fileStorageService.SaveFileAsync(request.Logo.Content, request.Logo.FileName, "uploads/teams");
        }

        if (request.Sponsor != null)
        {
            ValidateFile(request.Sponsor, "Sponsor");
            if (!string.IsNullOrEmpty(team.SponsorUrl))
            {
                await fileStorageService.DeleteFileAsync(team.SponsorUrl);
            }
            newSponsorUrl = await fileStorageService.SaveFileAsync(request.Sponsor.Content, request.Sponsor.FileName, "uploads/teams");
        }

        team.UpdateBranding(newLogoUrl, newSponsorUrl);
        await context.SaveChangesAsync(cancellationToken);

        return new BrandingUrlsDto(newLogoUrl, newSponsorUrl);
    }

    private static void ValidateFile(FileDto file, string propertyName)
    {
        var extension = Path.GetExtension(file.FileName).ToLower();
        string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

        if (!allowedExtensions.Contains(extension))
        {
            throw new Exception($"{propertyName}: Invalid file extension. Only jpg, png and webp are allowed.");
        }

        if (file.Length > 2 * 1024 * 1024)
        {
            throw new Exception($"{propertyName}: File size exceeds 2MB limit.");
        }
    }
}
